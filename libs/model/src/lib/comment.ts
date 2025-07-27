import { MessageStatus } from './chatgpt'

export interface Comment {
  id: string
  text: string
  userId: string
  status?: MessageStatus // only for chatgpt
  answerParsed?: string // only for chatgpt
  answerRaw?: string // only for chatgpt
  createdAt: Date
  updatedAt: Date
}

export function createComment(params: Partial<Comment> = {}): Comment {
  return {
    id: '',
    text: '',
    userId: params.userId ?? '',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...params,
  }
}
