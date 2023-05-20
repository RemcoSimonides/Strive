export type MessageType = 'RoadmapSuggestion' | 'RoadmapMoreInfoQuestions' | 'RoadmapMoreInfoAnswers' | 'RoadmapUpdateSuggestion'
export type MessageStatus = 'waiting' | 'streaming' | 'completed' | 'error' | 'no-trigger'

export interface ChatGPTMessage {
  id: string
  type: MessageType
  prompt: string
  answerRaw: string
  answerParsed: string[]
  status: MessageStatus
  updatedAt?: Date
  createdAt?: Date
}

export function createChatGPTMessage(params: Partial<ChatGPTMessage> = {}): ChatGPTMessage {
  return {
    id: '',
    type: 'RoadmapSuggestion',
    status: 'waiting',
    prompt: '',
    answerRaw: '',
    answerParsed: [],
    ...params,
  }
}
