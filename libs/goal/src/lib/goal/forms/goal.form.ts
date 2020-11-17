import { FormControl } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form';
import { createGoalLink, GoalLink } from "../+state/goal.firestore";

function createGoalLinkFormControl(params?: GoalLink) {
  const goalLink = createGoalLink(params)
  return {
    id: new FormControl(goalLink.id),
    title: new FormControl(goalLink.title),
    image: new FormControl(goalLink.image)
  }
}

export type GoalLinkFormControl = ReturnType<typeof createGoalLinkFormControl>

export class GoalLinkForm extends FormEntity<GoalLinkFormControl> {
  constructor(goalLink?: GoalLink) {
    super(createGoalLinkFormControl(goalLink))
  }

  get id() { return this.get('id') }
  get title() { return this.get('title') }
  get image() { return this.get('image') }
}