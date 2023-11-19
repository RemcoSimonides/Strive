import { FormControl, FormGroup } from '@angular/forms'
import { EmailNotificationSettings, PushNotificationSettings, Settings, createEmailNotificationSettings, createPushNotificationSettings } from '@strive/model'


function createSettingsFormControl(params?: Partial<Settings>) {
  return {
    emailNotification: new EmailNotificationSettingsForm(params?.emailNotification),
    pushNotification: new PushNotificationSettingsForm(params?.pushNotification)
  }
}

export type SettingsFormControl = ReturnType<typeof createSettingsFormControl>

export class SettingsForm extends FormGroup<SettingsFormControl> {
  constructor(settings?: Partial<Settings>) {
    super(createSettingsFormControl(settings))
  }

  get emailNotification() { return this.get('emailNotification')! }
  get pushNotification() { return this.get('pushNotification')! }
}

function createEmailNotificationSettingsFormControl(params?: Partial<EmailNotificationSettings>) {
  const settings = createEmailNotificationSettings(params)

  return {
    main: new FormControl(settings.main, { nonNullable: true }),
    monthlyGoalReminder: new FormControl(settings.monthlyGoalReminder, { nonNullable: true }),
  }
}

export type EmailNotificationSettingsFormControl = ReturnType<typeof createEmailNotificationSettingsFormControl>

export class EmailNotificationSettingsForm extends FormGroup<EmailNotificationSettingsFormControl> {
  constructor(settings?: Partial<EmailNotificationSettings>) {
    super(createEmailNotificationSettingsFormControl(settings))
  }

  get main() { return this.get('main')! }
  get monthlyGoalReminder() { return this.get('monthlyGoalReminder')! }
}

function createPushNotificationSettingsFormControl(params?: Partial<PushNotificationSettings>) {
  const settings = createPushNotificationSettings(params)

  return {
    main: new FormControl(settings.main, { nonNullable: true }),
    userSpectatingGeneral: new FormControl(settings.userSpectatingGeneral, { nonNullable: true }),
    supports: new FormControl(settings.supports, { nonNullable: true }),
    goalMain: new FormControl(settings.goalMain, { nonNullable: true }),
    goalGeneral: new FormControl(settings.goalGeneral, { nonNullable: true }),
    goalTeam: new FormControl(settings.goalTeam, { nonNullable: true }),
    goalChat: new FormControl(settings.goalChat, { nonNullable: true }),
    goalRoadmap: new FormControl(settings.goalRoadmap, { nonNullable: true }),
    goalStory: new FormControl(settings.goalStory, { nonNullable: true }),
    exerciseAffirmations: new FormControl(settings.exerciseAffirmations, { nonNullable: true }),
    exerciseDailyGratitude: new FormControl(settings.exerciseDailyGratitude, { nonNullable: true }),
    exerciseDearFutureSelf: new FormControl(settings.exerciseDearFutureSelf, { nonNullable: true }),
    exerciseSelfReflect: new FormControl(settings.exerciseSelfReflect, { nonNullable: true }),
    exerciseWheelOfLife: new FormControl(settings.exerciseWheelOfLife, { nonNullable: true })
  }
}

export type PushNotificationSettingsFormControl = ReturnType<typeof createPushNotificationSettingsFormControl>

export class PushNotificationSettingsForm extends FormGroup<PushNotificationSettingsFormControl> {
  constructor(settings?: Partial<PushNotificationSettings>) {
    super(createPushNotificationSettingsFormControl(settings))
  }

  get main() { return this.get('main')! }
  get userSpectatingGeneral() { return this.get('userSpectatingGeneral')! }
  get supports() { return this.get('supports')! }
  get goalMain() { return this.get('goalMain')! }
  get goalGeneral() { return this.get('goalGeneral')! }
  get goalTeam() { return this.get('goalTeam')! }
  get goalChat() { return this.get('goalChat')! }
  get goalRoadmap() { return this.get('goalRoadmap')! }
  get goalStory() { return this.get('goalStory')! }
  get exerciseAffirmations() { return this.get('exerciseAffirmations')! }
  get exerciseDailyGratitude() { return this.get('exerciseDailyGratitude')! }
  get exerciseDearFutureSelf() { return this.get('exerciseDearFutureSelf')! }
  get exerciseSelfReflect() { return this.get('exerciseSelfReflect')! }
  get exerciseWheelOfLife() { return this.get('exerciseWheelOfLife')! }

  disableControls() {
    this.userSpectatingGeneral.disable({ emitEvent: false })
    this.supports.disable({ emitEvent: false })
    this.goalMain.disable({ emitEvent: false })
    this.goalGeneral.disable({ emitEvent: false })
    this.goalTeam.disable({ emitEvent: false })
    this.goalChat.disable({ emitEvent: false })
    this.goalRoadmap.disable({ emitEvent: false })
    this.goalStory.disable({ emitEvent: false })
    this.exerciseAffirmations.disable({ emitEvent: false })
    this.exerciseDailyGratitude.disable({ emitEvent: false })
    this.exerciseDearFutureSelf.disable({ emitEvent: false })
    this.exerciseSelfReflect.disable({ emitEvent: false })
    this.exerciseWheelOfLife.disable({ emitEvent: false })
  }

  enableControls() {
    this.userSpectatingGeneral.enable({ emitEvent: false })
    this.supports.enable({ emitEvent: false })
    this.goalMain.enable({ emitEvent: false })
    this.goalGeneral.enable({ emitEvent: false })
    this.goalTeam.enable({ emitEvent: false })
    this.goalChat.enable({ emitEvent: false })
    this.goalRoadmap.enable({ emitEvent: false })
    this.goalStory.enable({ emitEvent: false })
    this.exerciseAffirmations.enable({ emitEvent: false })
    this.exerciseDailyGratitude.enable({ emitEvent: false })
    this.exerciseDearFutureSelf.enable({ emitEvent: false })
    this.exerciseSelfReflect.enable({ emitEvent: false })
  }
}