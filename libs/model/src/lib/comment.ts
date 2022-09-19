export interface Comment {
  id: string
  text: string
  userId: string
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
