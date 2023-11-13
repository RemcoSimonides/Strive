import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { ListEntries, createListEntries } from '@strive/model'

function createFormListFormControl(params?: Partial<ListEntries>) {
  const value = createListEntries(params)

  return {
    entries: new FormArray<FormControl<string>>(value.entries.map(v => new FormControl(v, { nonNullable: true })))
  }
}

export type FormListFormControl = ReturnType<typeof createFormListFormControl>

export class FormList extends FormGroup<FormListFormControl> {
  constructor(entries?: Partial<ListEntries>) {
    super(createFormListFormControl(entries))
  }

  get entries() { return this.get('entries')! as FormArray<FormControl<string>> }

  override patchValue(value: Partial<{ entries: string[] }>): void {
    if (value.entries) {
      const entries = value.entries.map(v => new FormControl(v, { nonNullable: true }))
      this.setControl('entries', new FormArray(entries))
    }
  }
}
