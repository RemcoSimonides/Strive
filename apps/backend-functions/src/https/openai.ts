import { functions } from '../internals/firebase'
import { logger } from 'firebase-functions'
import { ErrorResultResponse } from '../shared/utils'
import { wrapHttpsOnCallHandler } from '../internals/sentry'
import { Configuration, OpenAIApi } from 'openai'

/**
 * This function is accessible to anyone, go here to change it
 * https://console.cloud.google.com/functions
 */
export const askOpenAI = functions().https.onCall(wrapHttpsOnCallHandler('askOpenAI',
async (data: { prompt: string }, context): Promise<ErrorResultResponse> => {
  const { prompt } = data
  const { uid } = context.auth
  const { OPENAI_APIKEY } = process.env

  const configuration = new Configuration({
    apiKey: OPENAI_APIKEY,
  })
  const openai = new OpenAIApi(configuration);

  try {
    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt,
      max_tokens: 500,
      temperature: 1,
      user: uid
    })

    logger.log('completion: ', completion)
    logger.log(completion.data.choices[0].text)

    return {
      result: completion.data.choices[0].text,
      error: ''
    }

  } catch(error) {
    if (error.response) {
      logger.error(error.response.status)
      logger.error(error.response.data)

      return {
        error: error.response.status,
        result: error.response.data
      }
    } else {
      logger.error(error.message)

      return {
        error: '500',
        result: 'Something went wrong'
      }
    }
  }
}))