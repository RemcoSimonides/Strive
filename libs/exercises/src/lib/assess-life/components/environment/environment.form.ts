import { FormGroup } from '@angular/forms'
import { FormList } from '../../utils/form.utils'
import { AssessLifeEnvironment, createAssessLifeEnvironment } from '@strive/model'

function createEnvironmentFormControl(params?: Partial<AssessLifeEnvironment>) {
  const environment = createAssessLifeEnvironment(params)

  return {
    past: new FormList(environment.past),
    future: new FormList(environment.future)
  }
}

export type EnvironmentFormControl = ReturnType<typeof createEnvironmentFormControl>

export class EnvironmentForm extends FormGroup<EnvironmentFormControl> {
  constructor(environment?: Partial<AssessLifeEnvironment>) {
    super(createEnvironmentFormControl(environment))
  }

  get past() { return this.get('past')! as FormList }
  get future() { return this.get('future')! as FormList }
}