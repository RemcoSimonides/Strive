export type PromptType = 'RoadmapSuggestion' | 'RoadmapMoreInfoQuestions' | 'RoadmapMoreInfoAnswers'

export interface ChatGPTMessage {
  id: string
  type: PromptType
  prompt: string
  answer: string
  updatedAt?: Date
  createdAt?: Date
}

export function createChatGPTMessage(params: Partial<ChatGPTMessage> = {}): ChatGPTMessage {
  return {
    id: '',
    type: 'RoadmapSuggestion',
    prompt: '',
    answer: 'asking',
    ...params,
  }
}
