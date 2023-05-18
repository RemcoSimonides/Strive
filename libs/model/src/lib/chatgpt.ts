export type PromptType = 'RoadmapSuggestion' | 'RoadmapMoreInfoQuestion'

export interface ChatGPTMessage {
  type: PromptType
  prompt: string
  answer: string
  updatedAt?: Date
  createdAt?: Date
}

export function createChatGPTMessage(params: Partial<ChatGPTMessage> = {}): ChatGPTMessage {
  return {
    type: 'RoadmapSuggestion',
    prompt: '',
    answer: 'asking',
    ...params,
  }
}
