import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms'
import { SelfReflectSettings, SelfReflectTense, SelfReflectType, SelfReflectFrequencyWithNever, SelfReflectQuestion, WeekdayWithNever, createSelfReflectQuestion, createSelfReflectSettings, SelfReflectCategory } from '@strive/model'


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
    key: new FormControl<string>(question.key, { nonNullable: true, validators: [Validators.required] }),
    category: new FormControl<SelfReflectCategory>(question.category, { nonNullable: true, validators: [Validators.required] }),
    question: new FormControl<string>(question.question, { nonNullable: true, validators: [Validators.required] }),
    type: new FormControl<SelfReflectType>(question.type, { nonNullable: true, validators: [Validators.required] }),
    frequency: new FormControl<SelfReflectFrequencyWithNever>(question.frequency, { nonNullable: true, validators: [Validators.required] }),
    tense: new FormControl<SelfReflectTense>(question.tense, { nonNullable: true, validators: [Validators.required] })
  }
}

export type SelfReflectQuestionFormControl = ReturnType<typeof createSelfReflectQuestionFormControl>

export class SelfReflectQuestionForm extends FormGroup<SelfReflectQuestionFormControl> {
  constructor(question?: Partial<SelfReflectQuestion>) {
    super(createSelfReflectQuestionFormControl(question))
  }

  get key() { return this.get('key')! as FormControl }
  get category() { return this.get('category')! as FormControl }
  get question() { return this.get('question')! as FormControl }
  get type() { return this.get('type')! as FormControl }
  get frequency() { return this.get('frequency')! as FormControl }
  get tense() { return this.get('tense')! as FormControl }
}