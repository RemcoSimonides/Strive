import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { SelfReflectEntry, createSelfReflectEntry } from '@strive/model'

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

  get id() { return this.get('id')! as FormControl }

  override patchValue(entry: SelfReflectEntry, options?: { onlySelf?: boolean, emitEvent?: boolean }) {
    const excludedKeys = ['updatedAt', 'createdAt', 'frequency', 'config']

    Object.entries(entry).forEach(([key, value]) => {
      if (excludedKeys.includes(key)) return

      if (Array.isArray(value)) {
        const control = this.get(key) as FormArray<FormControl<string>> | undefined
        if (!control) throw new Error('Could not find form array control with key ' + key)
        control.clear()
        value.forEach((v) => control.push(new FormControl<string>(v, { nonNullable: true })))
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