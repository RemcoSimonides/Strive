import { DocumentReference, logger } from '@strive/api/firebase'
import OpenAI from 'openai'
import { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources'

export interface AskOpenAIConfig {
  model: ChatCompletionCreateParamsStreaming['model']
  answerRawPath: string
  answerParsedPath?: string
}

export async function askOpenAI(messages: ChatCompletionMessageParam[], ref: DocumentReference, config: AskOpenAIConfig): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY })
  const { answerRawPath, answerParsedPath } = config

  try {
    const stream = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      stream: true
    })

    let answerRaw = ''
    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta?.content
      if (delta) {
        answerRaw += delta
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
      }
    }
    ref.update({ status: 'completed' })
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