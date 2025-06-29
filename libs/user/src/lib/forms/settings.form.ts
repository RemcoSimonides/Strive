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

  get emailNotification() { return this.controls.emailNotification }
  get pushNotification() { return this.controls.pushNotification }
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

  get main() { return this.controls.main }
  get monthlyGoalReminder() { return this.controls.monthlyGoalReminder }
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

  get main() { return this.controls.main }
  get userSpectatingGeneral() { return this.controls.userSpectatingGeneral }
  get supports() { return this.controls.supports }
  get goalMain() { return this.controls.goalMain }
  get goalGeneral() { return this.controls.goalGeneral }
  get goalTeam() { return this.controls.goalTeam }
  get goalChat() { return this.controls.goalChat }
  get goalRoadmap() { return this.controls.goalRoadmap }
  get goalStory() { return this.controls.goalStory }
  get exerciseAffirmations() { return this.controls.exerciseAffirmations }
  get exerciseDailyGratitude() { return this.controls.exerciseDailyGratitude }
  get exerciseDearFutureSelf() { return this.controls.exerciseDearFutureSelf }
  get exerciseSelfReflect() { return this.controls.exerciseSelfReflect }
  get exerciseWheelOfLife() { return this.controls.exerciseWheelOfLife }

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