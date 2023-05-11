
export interface Settings {
  pushNotification: PushNotificationSettings
}

export function createSettings(params?: Partial<Settings>): Settings {
  return {
    pushNotification: createPushNotificationSettings(params?.pushNotification)
  }
}

export interface PushNotificationSettings {
  main: boolean
  userSpectatingGeneral: boolean
  supports: boolean
  goalMain: boolean
  goalGeneral: boolean
  goalTeam: boolean
  goalChat: boolean
  goalRoadmap: boolean
  goalStory: boolean
}

export type PushNotificationSettingKey = keyof PushNotificationSettings
export type PushNotificationSettingKeyExcludeMain = Exclude<PushNotificationSettingKey, 'main' | 'goalMain'>

export function createPushNotificationSettings(params?: Partial<PushNotificationSettings>): PushNotificationSettings {
  return {
    main: false, // main toggle to register push notifications on device
    userSpectatingGeneral: true,
    supports: true,
    goalMain: true,
    goalGeneral: true,
    goalTeam: true,
    goalChat: true,
    goalRoadmap: true,
    goalStory: true,
    ...params,
  }
}