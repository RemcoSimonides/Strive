import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Goal, createGoal, GoalPublicityType } from '@strive/model'

function createGoalFormControl(params?: Partial<Goal>) {
  const goal = createGoal(params)

  return {
    description: new FormControl(goal.description, { nonNullable: true }),
    image: new FormControl(goal.image, { nonNullable: true }),
    deadline: new FormControl(goal.deadline, { nonNullable: true, validators: [Validators.required] }),
    isSecret: new FormControl(goal.publicity === 'private', { nonNullable: true }),
    title: new FormControl(goal.title, { nonNullable: true, validators: [Validators.required]}),
  }
}

export type GoalFormControl = ReturnType<typeof createGoalFormControl>

export class GoalForm extends FormGroup<GoalFormControl> {
  constructor(goal?: Partial<Goal>) {
    super(createGoalFormControl(goal))
  }

  get title() { return this.get('title')! }
  get description() { return this.get('description')! }
  get deadline() { return this.get('deadline')! }
  get isSecret() { return this.get('isSecret')! }
  get image() { return this.get('image')! }

  getGoalValue() {
    const { description, image, deadline, isSecret, title } = this.value
    const publicity: GoalPublicityType = isSecret ? 'private' : 'public'

    return createGoal({
      description,
      title,
      image,
      deadline,
      publicity
    })
  }
}