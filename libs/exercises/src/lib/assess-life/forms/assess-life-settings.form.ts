import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { AssessLifeIntervalWithNever, AssessLifeQuestion, AssessLifeSettings, AssessLifeType, Setting, Step, WeekdayWithNever, createAssessLifeQuestion, createAssessLifeSettings } from '@strive/model'

function createAssessLifeMetaSettingsFormControl(questions: AssessLifeQuestion[]) {
  const value: Record<string, FormControl<AssessLifeIntervalWithNever>> = {}

  for (const question of questions) {
    if (value[question.setting]) continue
    value[question.setting] = new FormControl<AssessLifeIntervalWithNever>(question.interval, { nonNullable: true })
  }

  return value
}

export type AssessLifeMetaSettingsFormControl = ReturnType<typeof createAssessLifeMetaSettingsFormControl>

export class AssessLifeMetaSettingsForm extends FormGroup<AssessLifeMetaSettingsFormControl> {
  constructor(questions: AssessLifeQuestion[]) {
    super(createAssessLifeMetaSettingsFormControl(questions))
  }

  patchAllValue(questions: AssessLifeQuestion[]) {
    for (const question of questions) {
      if (this.controls[question.setting]) {
        this.controls[question.setting].patchValue(question.interval)
      } else {
        this.addControl(question.setting, new FormControl<AssessLifeIntervalWithNever>(question.interval, { nonNullable: true }))
      }
    }
  }
}

function createAssessLifeSettingsFormControl(params?: Partial<AssessLifeSettings>) {
  const settings = createAssessLifeSettings(params)

  return {
    questions: new FormArray<AssessLifeQuestionForm>(settings.questions.map(question => new AssessLifeQuestionForm(question))),
    preferredDay: new FormControl<WeekdayWithNever>(settings.preferredDay, { nonNullable: true }),
    preferredTime: new FormControl<string>(settings.preferredTime, { nonNullable: true }),
  }
}

export type AssessLifeSettingsFormControl = ReturnType<typeof createAssessLifeSettingsFormControl>

export class AssessLifeSettingsForm extends FormGroup<AssessLifeSettingsFormControl> {
  constructor(settings?: Partial<AssessLifeSettings>) {
    super(createAssessLifeSettingsFormControl(settings))
  }

  get preferredDay() { return this.get('preferredDay')! as FormControl }
  get preferredTime() { return this.get('preferredTime')! as FormControl }
  get questions() { return this.get('questions')! as FormArray<AssessLifeQuestionForm>}

  override patchValue(settings: AssessLifeSettings) {
    for (const question of settings.questions) {
      const control = this.questions.controls.find(ctrl => ctrl.key.value === question.key)
      if (!control) continue
      control.patchValue(question)
    }
    super.patchValue(settings)
  }
}

function createAssessLifeQuestionFormControl(params?: Partial<AssessLifeQuestion>) {
  const question = createAssessLifeQuestion(params)

  return {
    key: new FormControl<string>(question.key, { nonNullable: true }),
    step: new FormControl<Step>(question.step, { nonNullable: true }),
    question: new FormControl<string>(question.question, { nonNullable: true }),
    type: new FormControl<AssessLifeType>(question.type, { nonNullable: true }),
    interval: new FormControl<AssessLifeIntervalWithNever>(question.interval, { nonNullable: true }),
    setting: new FormControl<Setting>(question.setting, { nonNullable: true }),
  }
}

export type AssessLifeQuestionFormControl = ReturnType<typeof createAssessLifeQuestionFormControl>

export class AssessLifeQuestionForm extends FormGroup<AssessLifeQuestionFormControl> {
  constructor(question?: Partial<AssessLifeQuestion>) {
    super(createAssessLifeQuestionFormControl(question))
  }

  get key() { return this.get('key')! as FormControl }
  get step() { return this.get('step')! as FormControl }
  get question() { return this.get('question')! as FormControl }
  get type() { return this.get('type')! as FormControl }
  get interval() { return this.get('interval')! as FormControl }
  get setting() { return this.get('setting')! as FormControl }
}