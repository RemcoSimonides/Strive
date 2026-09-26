import { DocumentReference, logger } from '@strive/api/firebase'
import { ChatGPTMessage } from '@strive/model'
import OpenAI from 'openai'
import { ChatCompletionCreateParamsStreaming, ChatCompletionMessageParam } from 'openai/resources'

export const OPENAI_MODEL: ChatCompletionCreateParamsStreaming['model'] = 'gpt-4o'

export interface AskOpenAIConfig {
  model?: ChatCompletionCreateParamsStreaming['model']
  response_format?: ChatCompletionCreateParamsStreaming['response_format']
  /** turns the answer so far into the list shown as answerParsed; without it only answerRaw is written */
  parse?: (raw: string) => string[]
}

// A document takes about one sustained write per second; streaming faster than this only queues writes up.
const WRITE_INTERVAL_MS = 300

type ChatGPTDoc = Pick<ChatGPTMessage, 'answerParsed'|'answerRaw'|'status'>

function createChatGPTDoc(params: Partial<ChatGPTDoc> = {}) {
  return {
    answerParsed: params.answerParsed ?? [],
    answerRaw: params.answerRaw ?? '',
    status: params.status ?? 'waiting'
  }
}

export async function askOpenAI(messages: ChatCompletionMessageParam[], ref: DocumentReference, { model = OPENAI_MODEL, response_format, parse }: AskOpenAIConfig = {}): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_APIKEY })

  const doc = createChatGPTDoc({ status: 'streaming' })

  // Writes go out one at a time, so a slow partial update can never land after the final one.
  let writing: Promise<unknown> = Promise.resolve()
  let lastWrite = 0
  const write = () => {
    const snapshot = { ...doc }
    lastWrite = Date.now()
    writing = writing
      .then(() => ref.update(snapshot))
      .catch(error => logger.error('Writing OpenAI answer failed', error))
    return writing
  }

  try {
    const stream = await openai.chat.completions.create({
      model,
      messages,
      response_format,
      stream: true
    })

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content
      if (!delta) continue

      doc.answerRaw += delta
      if (parse) {
        doc.answerParsed = parse(doc.answerRaw)
        // the app shows answerRaw while nothing parsed yet: don't show it the bare JSON
        if (!doc.answerParsed.length) continue
      }

      if (Date.now() - lastWrite >= WRITE_INTERVAL_MS) write()
    }

    // awaited: once the handler returns the instance may be throttled and the write would never land
    doc.status = 'completed'
    await write()
    return doc.answerRaw
  } catch (error) {
    if (error instanceof OpenAI.APIError) {
      logger.error(`OpenAI ${error.status}: ${error.message}`)
    } else {
      logger.error(error)
    }

    doc.status = 'error'
    await write()
    return 'error'
  }
}
