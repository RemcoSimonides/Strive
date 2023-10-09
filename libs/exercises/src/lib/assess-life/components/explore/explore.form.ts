import { FormGroup } from '@angular/forms'
import { FormList } from '../../utils/form.utils'
import { AssessLifeExplore, createAssessLifeExplore } from '@strive/model'

function createExploreFormControl(params?: Partial<AssessLifeExplore>) {
  const explore = createAssessLifeExplore(params)

  return {
    past: new FormList(explore.past),
    future: new FormList(explore.future)
  }
}

export type ExploreFormControl = ReturnType<typeof createExploreFormControl>

export class ExploreForm extends FormGroup<ExploreFormControl> {
  constructor(explore?: Partial<AssessLifeExplore>) {
    super(createExploreFormControl(explore))
  }

  get past() { return this.get('past')! as FormList }
  get future() { return this.get('future')! as FormList }
}