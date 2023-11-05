import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { AssessLifeEntry, createAssessLifeEntry } from '@strive/model'

function createAssessLifeFormControl(params?: Partial<AssessLifeEntry>) {
  const assessLife = createAssessLifeEntry(params)

  return {
    id: new FormControl(assessLife.id, { nonNullable: true }),
  }
}

export type AssessLifeFormControl = ReturnType<typeof createAssessLifeFormControl>

export class AssessLifeForm extends FormGroup<AssessLifeFormControl> {
  constructor(assessLife?: Partial<AssessLifeEntry>) {
    super(createAssessLifeFormControl(assessLife))
  }

  get id() { return this.get('id')! as FormControl }

  override patchValue(entry: AssessLifeEntry, options?: { onlySelf?: boolean, emitEvent?: boolean }) {
    const excludedKeys = ['updatedAt', 'createdAt', 'interval', 'config']

    Object.entries(entry).forEach(([key, value]) => {
      if (excludedKeys.includes(key)) return

      if (Array.isArray(value)) {
        const control = this.get(key) as FormArray<FormControl<string>> | undefined
        if (!control) throw new Error('Could not find form array control with key ' + key)
        control.clear()
        value.forEach((v) => control.push(new FormControl<string>(v as string, { nonNullable: true }))) // overwriting type on v because it can't be of type AssessLifeQuestionConfig as its excluded
      } else if (typeof value === 'object') {
        const control = this.get(key) as FormGroup | undefined
        if (!control) throw new Error('Could not find form group control with key ' + key)
        control.patchValue(value, options)
      } else if (typeof value === 'string') {
        const control = this.get(key) as FormControl<string> | undefined
        if (!control) throw new Error('Could not find form control with key ' + key)
        control.patchValue(value, options)
      }
    })
  }
}