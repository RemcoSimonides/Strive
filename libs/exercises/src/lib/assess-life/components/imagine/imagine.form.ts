import { FormControl, FormGroup } from '@angular/forms'
import { AssessLifeImagine, createAssessLifeImagine } from '@strive/model'

function createImagineFormControl(params?: Partial<AssessLifeImagine>) {
  const imagine = createAssessLifeImagine(params)

  return {
    future: new FormControl(imagine.future, { nonNullable: true }),
    die: new FormControl(imagine.die, { nonNullable: true }),
  }
}

export type AssessLifeImagineFormControl = ReturnType<typeof createImagineFormControl>

export class ImagineForm extends FormGroup<AssessLifeImagineFormControl> {
  constructor(imagine?: Partial<AssessLifeImagine>) {
    super(createImagineFormControl(imagine))
  }

  get future() { return this.get('future')! }
  get die() { return this.get('die')! }
}