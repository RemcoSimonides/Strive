import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { SelfReflectEntry, createSelfReflectEntry } from '@strive/model'
import { WheelOfLifeForm } from '../components/wheel-of-life/wheel-of-life.form'

function createSelfReflectFormControl(params?: Partial<SelfReflectEntry>) {
  const selfReflect = createSelfReflectEntry(params)

  return {
    id: new FormControl(selfReflect.id, { nonNullable: true }),
  }
}

export type SelfReflectFormControl = ReturnType<typeof createSelfReflectFormControl>

export class SelfReflectForm extends FormGroup<SelfReflectFormControl> {
  constructor(selfReflect?: Partial<SelfReflectEntry>) {
    super(createSelfReflectFormControl(selfReflect))
  }

  get id() { return this.controls.id }
  get wheelOfLife() {
    const control = this.get('wheelOfLife') as FormGroup | null
    if (!control) throw new Error('Could not find wheelOfLife form group control')
    return control as WheelOfLifeForm
  }
  get prioritizeGoals() {
    const control = this.get('prioritizeGoals') as FormArray | null
    if (!control) throw new Error('Could not find prioritizeGoals form array control')
    return control as FormArray<FormControl<string>>
  }

  override patchValue(entry: SelfReflectEntry, options?: { onlySelf?: boolean, emitEvent?: boolean }) {
    const excludedKeys = ['updatedAt', 'createdAt', 'frequency', 'config']

    Object.entries(entry).forEach(([key, value]) => {
      if (excludedKeys.includes(key)) return

      if (Array.isArray(value)) {
        const control = this.get(key) as FormArray<FormControl<string>> | undefined
        if (!control) throw new Error('Could not find form array control with key ' + key)
        control.clear()
        value.forEach((v) => control.push(new FormControl<string>((v as string), { nonNullable: true })))
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

  // return control with type FormControl instead of AbstractControl
  getFormControl(key: string): FormControl<string> {
    const control = this.get(key)
    if (!control) throw new Error('Could not find form control with key ' + key)
    if (!(control instanceof FormControl)) throw new Error('Control with key ' + key + ' is not a FormControl')
    return control as FormControl<string>
  }

  getFormArray(key: string): FormArray<FormControl<string>> {
    const control = this.get(key)
    if (!control) throw new Error('Could not find form array with key ' + key)
    if (!(control instanceof FormArray)) throw new Error('Control with key ' + key + ' is not a FormArray')
    return control as FormArray<FormControl<string>>
  }
}