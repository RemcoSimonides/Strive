import { FormGroup } from '@angular/forms'
import { FormList } from '../../utils/form.utils'
import { Learn, createLearn } from '@strive/model'

function createLearnFormControl(params?: Partial<Learn>) {
  const learn = createLearn(params)

  return {
    past: new FormList(learn.past),
    future: new FormList(learn.future)
  }
}

export type LearnFormControl = ReturnType<typeof createLearnFormControl>

export class LearnForm extends FormGroup<LearnFormControl> {
  constructor(learn?: Partial<Learn>) {
    super(createLearnFormControl(learn))
  }

  get past() { return this.get('past')! as FormList }
  get future() { return this.get('future')! as FormList }
}