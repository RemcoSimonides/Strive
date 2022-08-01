export interface Personal {
  uid: string
  email: string
  fcmTokens: string[]
  lastCheckedNotifications: false | Date
  updatedAt?: Date
  createdAt?: Date
}

export function createPersonal(params: Partial<Personal> = {}): Personal {
  return {
    uid: '',
    email: '',
    fcmTokens: [],
    lastCheckedNotifications: false,
    ...params
  }
}