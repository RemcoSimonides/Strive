export interface Message {
  description: string
  deliveryDate: Date
  createdAt: Date
}

export function createMessage(params?: Partial<Message>) {
  return {
    description: '',
    deliveryDate: new Date(),
    createdAt: new Date(),
    ...params
  }
}

export interface DearFutureSelf {
  id?: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export function createDearFutureSelf(params?: Partial<DearFutureSelf>) {
  return {
    id: '',
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...params
  }
}
