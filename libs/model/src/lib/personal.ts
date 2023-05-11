import { Settings, createSettings } from './settings'

export interface Personal {
  uid: string
  email: string
  fcmTokens: string[]
  key: string
  lastCheckedNotifications: Date
  settings: Settings
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
    ...params,
    settings: createSettings(params.settings)
  }
}