import { FormControl, Validators } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form'
import { createSupport, Support } from '@strive/model'

function createSupportFormControl(params?: Support) {
  const support = createSupport(params)
  return {
    description: new FormControl(support.description, [Validators.required])
  }
}

export type SupportFormControl = ReturnType<typeof createSupportFormControl>

export class SupportForm extends FormEntity<SupportFormControl> {
  constructor(support?: Support) {
    super(createSupportFormControl(support))
  }

  get description() { return this.get('description') }
}
