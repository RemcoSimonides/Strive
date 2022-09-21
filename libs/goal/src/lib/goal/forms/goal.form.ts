import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Goal, createGoal, GoalPublicityType } from '@strive/model'

function createGoalFormControl(params?: Partial<Goal>) {
  const goal = createGoal(params)

  return {
    description: new FormControl(goal.description, { nonNullable: true }),
    image: new FormControl(goal.image, { nonNullable: true }),
    isFinished: new FormControl(!!goal.isFinished, { nonNullable: true }),
    deadline: new FormControl(goal.deadline, { nonNullable: true }),
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
  get isSecret() { return this.get('isSecret')! }
  get image() { return this.get('image')! }
  get isFinished() { return this.get('isFinished')! }

  getGoalValue() {
    const { description, image, deadline, isSecret, title, isFinished } = this.value
    const publicity: GoalPublicityType = isSecret ? 'private' : 'public'

    return createGoal({
      description,
      title,
      image,
      isFinished,
      deadline,
      publicity
    })
  }
}