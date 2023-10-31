import { FormControl, FormGroup } from '@angular/forms'
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
}