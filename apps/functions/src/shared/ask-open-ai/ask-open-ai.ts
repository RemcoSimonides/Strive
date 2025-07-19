import { DocumentReference, logger } from '@strive/api/firebase'
import { ChatGPTMessage } from '@strive/model'
import { delay } from '@strive/utils/helpers'
import OpenAI from 'openai'
import { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources'
import { parseRaw } from './parse'

export interface AskOpenAIConfig {
  model: ChatCompletionCreateParamsStreaming['model']
  parse: boolean,
  response_format: ChatCompletionCreateParamsStreaming['response_format']
}

type ChatGPTDoc = Pick<ChatGPTMessage, 'answerParsed'|'answerRaw'|'status'>

function createChatGPTDoc(params: Partial<ChatGPTDoc> = {}) {
  return {
    answerParsed: params.answerParsed ?? [],
    answerRaw: params.answerRaw ?? '',
    status: params.status ?? 'waiting'
  }
}

export async function askOpenAI(messages: ChatCompletionMessageParam[], ref: DocumentReference, { model, parse }: AskOpenAIConfig): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY })

  let counter = 0
  const doc = createChatGPTDoc({ status: 'streaming' })
  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      stream: true
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0].delta?.content
      if (delta) {
        doc.answerRaw += delta
        if (!doc.answerRaw) continue

        if (parse) {
          const parsed = parseRaw(doc.answerRaw)
          if (parsed) doc.answerParsed = parsed
        }

        if (counter % 10) ref.update(doc) // only update every 5th iteration
      }
      counter++
    }

    doc.status = 'completed'
    delay(500).then(() => ref.update(doc))
    return doc.answerRaw
  } catch (error) {
    if (error.response) {
      logger.error(error.response.status)
      logger.error(error.response.data)
    } else {
      logger.error(error.message)
    }

    doc.status = 'error'
    ref.update(doc)
    return 'error'
  }
}

