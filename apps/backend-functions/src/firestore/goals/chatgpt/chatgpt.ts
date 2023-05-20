import { DocumentReference, RuntimeOptions, db, logger, onDocumentCreate } from '@strive/api/firebase'
import { ChatGPTMessage, createChatGPTMessage } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'

const config: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '1GB',
}

export const chatGPTMessageCreatedHandler = onDocumentCreate(`Goals/{goalId}/ChatGPT/{messageId}`, 'chatGPTMessageCreatedHandler',
async (snapshot, context) => {

  const message = createChatGPTMessage(toDate({ ...snapshot.data(), id: snapshot.id }))
  const goalId = context.params.goalId

  const messages: ChatCompletionRequestMessage[] = [
    { role: 'system', content: `You're a life coach helping the user to break down its goal in smaller steps and help the user to stay focused on this goal` },
  ]

  if (message.type === 'RoadmapSuggestion') {
    messages.push({
      role: 'user',
      content: `${message.prompt} Don't suggest a due date for the milestones and don't use numbering for each milestone. The format of your response has to be a JSON parsable array of strings.`
    })
    await askOpenAI(messages, snapshot.ref)
    return
  }

  if (message.type === 'RoadmapMoreInfoQuestions') {
    const content = `${message.prompt} The format of your response has to be a JSON parsable array of strings.`
    messages.push({ role: 'user', content })
    await askOpenAI(messages, snapshot.ref)
    return
  }

  if (message.type === 'RoadmapMoreInfoAnswers') {
    const snaps = await db.collection(`Goals/${goalId}/ChatGPT`).get()
    const existing = snaps.docs.map(doc => createChatGPTMessage(toDate({ ...doc.data(), id: doc.id })))

    const roadmap = existing.find(m => m.type === 'RoadmapSuggestion')
    const qa = existing.filter(m => m.type === 'RoadmapMoreInfoAnswers').map(m => m.prompt).join(', ')

    if (!roadmap) throw new Error('Need roadmap because it contains the initial goal description')

    messages.push({ role: 'user', content: roadmap.prompt })
    messages.push({ role: 'assistant', content: roadmap.answerRaw })
    messages.push({
      role: 'user',
      content: `Here is some more information about the goal: ${qa}. Please further specify the roadmap based on this information. The format of your response has to be a JSON parsable array of strings.`
    })

    const ref = db.doc(`Goals/${goalId}/ChatGPT/RoadmapSuggestion`)
    const answer = await askOpenAI(messages, ref)

    messages.push({ role: 'assistant', content: answer })
    messages.push({
      role: 'user',
      content: `What are 3 questions you would ask the user to create a more specific roadmap? The format of your response has to be a JSON parsable array of strings.`
    })

    await askOpenAI(messages, db.doc(`Goals/${goalId}/ChatGPT/RoadmapMoreInfoQuestions`))
    return
  }

}, config)

async function askOpenAI(messages: ChatCompletionRequestMessage[], ref: DocumentReference): Promise<string> {
  const configuration = new Configuration({ apiKey: process.env.OPENAI_APIKEY })
  const openai = new OpenAIApi(configuration)

  try {
    let answerRaw = ''
    const promise = new Promise<string>((resolve, reject) => {
      const completion = openai.createChatCompletion({
        model: 'gpt-4',
        messages,
        max_tokens: 1200,
        stream: true
      }, { responseType: 'stream' })

      completion.then(({ data: stream }: any) => {
        stream.on('data', (chunk: Buffer) => {
          // Messages in the event stream are separated by a pair of newline characters.
          const payloads = chunk.toString().split('\n\n')
          for (const payload of payloads) {
            if (payload.includes('[DONE]')) return
            if (!payload.startsWith("data:")) continue

            const data = payload.replaceAll(/(\n)?^data:\s*/g, '') // in case there's multiline data event

            try {
              const delta = JSON.parse(data.trim())
              const content = delta.choices[0].delta?.content
              if (!content) continue

              answerRaw += content
              if (!answerRaw) continue

              const parsed = parse(answerRaw)
              const doc: Partial<ChatGPTMessage> = { answerRaw, status: 'streaming' }
              if (parsed) doc.answerParsed = parsed

              ref.update(doc)
            } catch (error) {
              logger.error(`Error with JSON.parse and ${payload}.\n${error}`)
            }
          }
        })

        stream.on('end', () => {
          logger.log('Stream done: ', answerRaw)
          const doc: Partial<ChatGPTMessage> = { status: 'completed' }
          ref.update(doc)
          resolve(answerRaw)
        })

        stream.on('error', reject)
      })
    })

    return await promise

  } catch (error) {
    if (error.response) {
      logger.error(error.response.status)
      logger.error(error.response.data)
    } else {
      logger.error(error.message)
    }

    const doc: Partial<ChatGPTMessage> = { status: 'error' }
    ref.update(doc)
    return 'error'
  }
}

function parse(answer: string): string[] | undefined {
  let value = answer.trim().replace(/\r?\n|\r/g, '').trim()  // regex removes new lines

  if (value.split('"').length % 2 === 0) value = value + '"'
  if (value.startsWith('[') && !value.endsWith(']')) value = value + ']'

  try {
    const parsed = JSON.parse(value)
    logger.log('parsed: ', parsed)
    if (!Array.isArray(parsed)) return
    logger.log('is array')
    if (parsed.some(item => typeof item !== 'string')) return
    logger.log('all string')

    return parsed
  } catch (e) {
    return
  }
}