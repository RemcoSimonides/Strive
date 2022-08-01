export interface Message {
  description: string
  deliveryDate: Date
  createdAt: Date
}

export interface DearFutureSelf {
  id?: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}
