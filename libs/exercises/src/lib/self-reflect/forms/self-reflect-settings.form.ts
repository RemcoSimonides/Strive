import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { SelfReflectSettings, SelfReflectTense, SelfReflectType, SelfReflectIntervalWithNever, SelfReflectQuestion, Setting, Step, WeekdayWithNever, createSelfReflectQuestion, createSelfReflectSettings } from '@strive/model'

function createSelfReflectMetaSettingsFormControl(questions: SelfReflectQuestion[]) {
  const value: Record<string, FormControl<SelfReflectIntervalWithNever>> = {}

  for (const question of questions) {
    if (value[question.setting]) continue
    value[question.setting] = new FormControl<SelfReflectIntervalWithNever>(question.interval, { nonNullable: true })
  }

  return value
}

export type SelfReflectMetaSettingsFormControl = ReturnType<typeof createSelfReflectMetaSettingsFormControl>

export class SelfReflectMetaSettingsForm extends FormGroup<SelfReflectMetaSettingsFormControl> {
  constructor(questions: SelfReflectQuestion[]) {
    super(createSelfReflectMetaSettingsFormControl(questions))
  }

  patchAllValue(questions: SelfReflectQuestion[]) {
    for (const question of questions) {
      if (this.controls[question.setting]) {
        this.controls[question.setting].patchValue(question.interval)
      } else {
        this.addControl(question.setting, new FormControl<SelfReflectIntervalWithNever>(question.interval, { nonNullable: true }))
      }
    }
  }
}

function createSelfReflectSettingsFormControl(params?: Partial<SelfReflectSettings>) {
  const settings = createSelfReflectSettings(params)

  return {
    questions: new FormArray<SelfReflectQuestionForm>(settings.questions.map(question => new SelfReflectQuestionForm(question))),
    preferredDay: new FormControl<WeekdayWithNever>(settings.preferredDay, { nonNullable: true }),
    preferredTime: new FormControl<string>(settings.preferredTime, { nonNullable: true }),
  }
}

export type SelfReflectSettingsFormControl = ReturnType<typeof createSelfReflectSettingsFormControl>

export class SelfReflectSettingsForm extends FormGroup<SelfReflectSettingsFormControl> {
  constructor(settings?: Partial<SelfReflectSettings>) {
    super(createSelfReflectSettingsFormControl(settings))
  }

  get preferredDay() { return this.get('preferredDay')! as FormControl }
  get preferredTime() { return this.get('preferredTime')! as FormControl }
  get questions() { return this.get('questions')! as FormArray<SelfReflectQuestionForm>}

  override patchValue(settings: SelfReflectSettings, options?: { onlySelf?: boolean, emitEvent?: boolean }) {
    for (const question of settings.questions) {
      const control = this.questions.controls.find(ctrl => ctrl.key.value === question.key)
      if (control) {
        control.patchValue(question, options)
      } else {
        this.questions.controls.push(new SelfReflectQuestionForm(question))
      }
    }
    super.patchValue(settings, options)
  }
}

function createSelfReflectQuestionFormControl(params?: Partial<SelfReflectQuestion>) {
  const question = createSelfReflectQuestion(params)

  return {
    key: new FormControl<string>(question.key, { nonNullable: true }),
    step: new FormControl<Step>(question.step, { nonNullable: true }),
    question: new FormControl<string>(question.question, { nonNullable: true }),
    type: new FormControl<SelfReflectType>(question.type, { nonNullable: true }),
    interval: new FormControl<SelfReflectIntervalWithNever>(question.interval, { nonNullable: true }),
    setting: new FormControl<Setting>(question.setting, { nonNullable: true }),
    tense: new FormControl<SelfReflectTense>(question.tense, { nonNullable: true })
  }
}

export type SelfReflectQuestionFormControl = ReturnType<typeof createSelfReflectQuestionFormControl>

export class SelfReflectQuestionForm extends FormGroup<SelfReflectQuestionFormControl> {
  constructor(question?: Partial<SelfReflectQuestion>) {
    super(createSelfReflectQuestionFormControl(question))
  }

  get key() { return this.get('key')! as FormControl }
  get step() { return this.get('step')! as FormControl }
  get question() { return this.get('question')! as FormControl }
  get type() { return this.get('type')! as FormControl }
  get interval() { return this.get('interval')! as FormControl }
  get setting() { return this.get('setting')! as FormControl }
  get tense() { return this.get('tense')! as FormControl }
}