
export interface Settings {
  emailNotification: EmailNotificationSettings
  pushNotification: PushNotificationSettings
}

export function createSettings(params?: Partial<Settings>): Settings {
  return {
    emailNotification: createEmailNotificationSettings(params?.emailNotification),
    pushNotification: createPushNotificationSettings(params?.pushNotification)
  }
}

export interface EmailNotificationSettings {
  main: boolean
  monthlyGoalReminder: boolean
}

export type EmailNotificationSettingKey = keyof EmailNotificationSettings

export function createEmailNotificationSettings(params?: Partial<EmailNotificationSettings>): EmailNotificationSettings {
  return {
    main: true,
    monthlyGoalReminder: true,
    ...params,
  }
}

export interface PushNotificationSettings {
  main: boolean | null
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
    main: null, // main toggle to register push notifications on device
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

export interface GoalSettings {
  goalChat: boolean
}

export function createGoalSettings(params: Partial<GoalSettings> = {}): GoalSettings {
  return {
    goalChat: true,
    ...params,
  }
}