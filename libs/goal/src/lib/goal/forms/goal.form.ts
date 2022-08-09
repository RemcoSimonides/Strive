import { FormControl, FormGroup, Validators } from '@angular/forms'
import { createGoalLink, GoalLink, Goal, createGoal } from '@strive/model'

function createGoalLinkFormControl(params?: GoalLink) {
  const goalLink = createGoalLink(params)
  return {
    id: new FormControl(goalLink.id),
    title: new FormControl(goalLink.title),
    image: new FormControl(goalLink.image)
  }
}

export type GoalLinkFormControl = ReturnType<typeof createGoalLinkFormControl>

export class GoalLinkForm extends FormGroup<GoalLinkFormControl> {
  constructor(goalLink?: GoalLink) {
    super(createGoalLinkFormControl(goalLink))
  }

  get id() { return this.get('id')! }
  get title() { return this.get('title')! }
  get image() { return this.get('image')! }
}

function createGoalFormControl(params?: Partial<Goal>) {
  const goal = createGoal(params);
  return {
    description: new FormControl(goal.description, { nonNullable: true }),
    image: new FormControl(goal.image, { nonNullable: true }),
    status: new FormControl(goal.status, { nonNullable: true }),
    deadline: new FormControl(goal.deadline, { nonNullable: true }),
    numberOfAchievers: new FormControl(goal.numberOfAchievers, { nonNullable: true }),
    numberOfCustomSupports: new FormControl(goal.numberOfCustomSupports, { nonNullable: true }),
    numberOfSupporters: new FormControl(goal.numberOfSupporters, { nonNullable: true }),
    publicity: new FormControl(goal.publicity, { nonNullable: true }),
    isSecret: new FormControl(goal.publicity === 'private', { nonNullable: true }),
    title: new FormControl(goal.title, { nonNullable: true, validators: [Validators.required]}),
    totalNumberOfCustomSupports: new FormControl(goal.totalNumberOfCustomSupports, { nonNullable: true })
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
  get publicity() { return this.get('publicity')! }
  get image() { return this.get('image')! }
}