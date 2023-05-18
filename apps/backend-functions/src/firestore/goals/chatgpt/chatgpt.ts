import { RuntimeOptions, db, logger, onDocumentCreate } from '@strive/api/firebase'
import { createChatGPTMessage } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'
import { smartJoin } from '@strive/utils/helpers'

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
    const content = `${message.prompt} Don't suggest a due date for the milestones and don't use numbering for each milestone. The format of your response has to be a JSON parsable array of strings.`

    messages.push({ role: 'user', content })
    message.answer = await askOpenAI(messages)

    snapshot.ref.update({ answer: message.answer })
  }

  if (message.type === 'RoadmapMoreInfoQuestions') {
    const content = `${message.prompt} The format of your response has to be a JSON parsable array of strings.`
    messages.push({ role: 'user', content })
    message.answer = await askOpenAI(messages)

    snapshot.ref.update({ answer: message.answer })
  }

  if (message.type === 'RoadmapMoreInfoAnswers') {
    const snaps = await db.collection(`Goals/${goalId}/ChatGPT`).get()
    const existing = snaps.docs.map(doc => createChatGPTMessage(toDate({ ...doc.data(), id: doc.id })))

    const roadmap = existing.find(m => m.type === 'RoadmapSuggestion')
    const qa = existing.filter(m => m.type === 'RoadmapMoreInfoAnswers').map(m => m.prompt)
    const questionsAndAnswers = smartJoin(qa, ', ', ' and')

    if (!roadmap) {
      logger.error('Need roadmap because it contains the initial goal description')
    }

    messages.push({ role: 'user', content: roadmap.prompt })
    messages.push({ role: 'assistant', content: roadmap.answer })
    messages.push({
      role: 'user',
      content: `Here is some more information about the goal: ${questionsAndAnswers}. Please further specify the roadmap based on this information. The format of your response has to be a JSON parsable array of strings.`
    })

    const answer = await askOpenAI(messages)
    const ref = db.doc(`Goals/${goalId}/ChatGPT/RoadmapSuggestion`)
    ref.update({ answer })

    messages.push({ role: 'assistant', content: answer })
    messages.push({
      role: 'user',
      content: `What are 3 questions you would ask the user to create a more specific roadmap? The format of your response has to be a JSON parsable array of strings.`
    })

    const newQuestions = await askOpenAI(messages)
    const moreInfoQuestionsRef = db.doc(`Goals/${goalId}/ChatGPT/RoadmapMoreInfoQuestions`)
    moreInfoQuestionsRef.update({ answer: newQuestions })
  }

}, config)

async function askOpenAI(messages: ChatCompletionRequestMessage[]) {
  const { OPENAI_APIKEY } = process.env
  const configuration = new Configuration({ apiKey: OPENAI_APIKEY })
  const openai = new OpenAIApi(configuration)

  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-4',
      messages
    })

    logger.log('all messages: ', messages)
    logger.log('answer: ', completion.data.choices[0].message)

    return completion.data.choices[0].message.content

  } catch (error) {
    if (error.response) {
      logger.error(error.response.status)
      logger.error(error.response.data)
    } else {
      logger.error(error.message)
    }

    return 'error'
  }
}