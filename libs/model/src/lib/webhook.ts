export type WebhookEvent =
  | 'goal.created'
  | 'goal.updated'
  | 'goal.completed'
  | 'milestone.completed'
  | 'post.created'

export interface Webhook {
  id: string
  uid: string
  url: string
  events: WebhookEvent[]
  secret: string
  active: boolean
  createdAt?: Date
  updatedAt?: Date
}

export function createWebhook(params: Partial<Webhook> = {}): Webhook {
  return {
    id: '',
    uid: '',
    url: '',
    events: [],
    secret: '',
    active: true,
    ...params
  }
}
