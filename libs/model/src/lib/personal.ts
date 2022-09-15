export interface Personal {
  uid: string
  email: string
  fcmTokens: string[]
  key: string
  lastCheckedNotifications: Date
  updatedAt?: Date
  createdAt?: Date
}

export function createPersonal(params: Partial<Personal> = {}): Personal {
  return {
    uid: '',
    email: '',
    key: '',
    fcmTokens: [],
    lastCheckedNotifications: new Date(),
    ...params
  }
}