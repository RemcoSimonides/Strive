import { FormControl, FormGroup } from '@angular/forms'
import { AssessLifeDearFutureSelf, createAssessLifeDearFutureSelf } from '@strive/model'

function createDearFutureSelfFormControl(params?: Partial<AssessLifeDearFutureSelf>) {
  const dearFutureSelf = createAssessLifeDearFutureSelf(params)

  return {
    advice: new FormControl(dearFutureSelf.advice, { nonNullable: true }),
    predictions: new FormControl(dearFutureSelf.predictions, { nonNullable: true }),
    anythingElse: new FormControl(dearFutureSelf.anythingElse, { nonNullable: true })
  }
}

export type AssessLifeDearFutureSelfForm = ReturnType<typeof createDearFutureSelfFormControl>

export class DearFutureSelfForm extends FormGroup<AssessLifeDearFutureSelfForm> {
  constructor(dearFutureSelf?: Partial<AssessLifeDearFutureSelf>) {
    super(createDearFutureSelfFormControl(dearFutureSelf))
  }

  get advice() { return this.get('advice')! }
  get predictions() { return this.get('predictions')! }
  get anythingElse() { return this.get('anythingElse')! }
}