import { RuntimeOptions, logger, onDocumentCreate } from '@strive/api/firebase'
import { createChatGPTMessage } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { Configuration, OpenAIApi, ChatCompletionRequestMessage } from 'openai'

const config: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '1GB',
}

export const chatGPTMessageCreatedHandler = onDocumentCreate(`Goals/{goalId}/ChatGPT/{messageId}`, 'chatGPTMessageCreatedHandler',
async (snapshot, context) => {

  const message = createChatGPTMessage(toDate({ ...snapshot.data(), id: snapshot.id }))

  const messages: ChatCompletionRequestMessage[] = [
    { role: 'system', content: `You're a life coach helping the user to break down its goal in smaller steps and help the user to stay focused on this goal` },
  ]

  if (message.type === 'RoadmapSuggestion') {
    const content = `${message.prompt} Don't suggest a due date for the milestones and don't use numbering for each milestone. The format of your response has to be a JSON parsable array of strings.`

    messages.push({ role: 'user', content })
    message.answer = await askOpenAI(messages)

    logger.log('message', message)

    snapshot.ref.update({ answer: message.answer })
  }

  if (message.type === 'RoadmapMoreInfoQuestion') {
    const content = `${message.prompt} The format of your response has to be a JSON parsable array of strings.`
    messages.push({ role: 'user', content })
    message.answer = await askOpenAI(messages)

    logger.log('message', message)

    snapshot.ref.update({ answer: message.answer })
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

    logger.log(completion.data.choices[0].message)

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