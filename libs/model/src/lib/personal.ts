import { Settings, createSettings } from './settings'

export interface Personal {
  uid: string
  email: string
  fcmTokens: string[]
  key: string
  lastCheckedNotifications: Date
  settings: Settings
  oauthTokens: Record<string, string>
  encryptedApiKeys: Record<string, string>
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
    oauthTokens: {},
    encryptedApiKeys: {},
    ...params,
    settings: createSettings(params.settings),
  }
}