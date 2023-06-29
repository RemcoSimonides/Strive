import { DocumentReference, logger } from '@strive/api/firebase'
import { delay } from '@strive/utils/helpers'
import { ChatCompletionRequestMessage, Configuration, CreateChatCompletionRequest, OpenAIApi } from 'openai'

export interface AskOpenAIConfig {
  model: CreateChatCompletionRequest['model']
  answerRawPath: string
  answerParsedPath?: string
}

export async function askOpenAI(messages: ChatCompletionRequestMessage[], ref: DocumentReference, config: AskOpenAIConfig): Promise<string> {
  const configuration = new Configuration({ apiKey: process.env.OPENAI_APIKEY })
  const openai = new OpenAIApi(configuration)
  const { answerRawPath, answerParsedPath } = config

  try {
    let answerRaw = ''
    const promise = new Promise<string>((resolve, reject) => {
      const completion = openai.createChatCompletion({
        model: 'gpt-4',
        messages,
        max_tokens: 600,
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

              const doc = { status: 'streaming' }
              doc[answerRawPath] = answerRaw

              if (answerParsedPath) {
                const parsed = parse(answerRaw)
                if (parsed) {
                  doc[answerParsedPath] = parsed
                }
              }

              ref.update(doc)
            } catch (error) {
              logger.error(`Error with JSON.parse and ${payload}.\n${error}`)
            }
          }
        })

        stream.on('end', () => {
          logger.log('Stream done: ', answerRaw)
          delay(500).then(() => ref.update({ status: 'completed' }))
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

    const doc = { status: 'error' }
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
    if (!Array.isArray(parsed)) return
    if (parsed.some(item => typeof item !== 'string')) return

    return parsed
  } catch (e) {
    return
  }
}