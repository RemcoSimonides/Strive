export interface Personal {
  uid: string
  email: string
  fcmTokens: string[]
  lastCheckedNotifications: Date
  updatedAt?: Date
  createdAt?: Date
}

export function createPersonal(params: Partial<Personal> = {}): Personal {
  return {
    uid: '',
    email: '',
    fcmTokens: [],
    lastCheckedNotifications: new Date(),
    ...params
  }
}