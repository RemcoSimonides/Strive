import { FormControl, FormGroup, Validators } from '@angular/forms'
import { Goal, createGoal, GoalPublicityType } from '@strive/model'

function createGoalFormControl(params?: Partial<Goal>) {
  const goal = createGoal(params)

  return {
    description: new FormControl(goal.description, { nonNullable: true }),
    image: new FormControl(goal.image, { nonNullable: true }),
    deadline: new FormControl(goal.deadline, { nonNullable: true, validators: [Validators.required] }),
    publicity: new FormControl<GoalPublicityType>('private', { nonNullable: true }),
    title: new FormControl(goal.title, { nonNullable: true, validators: [Validators.required]}),
    categories: new FormControl(goal.categories, { nonNullable: true })
  }
}

export type GoalFormControl = ReturnType<typeof createGoalFormControl>

export class GoalForm extends FormGroup<GoalFormControl> {
  constructor(goal?: Partial<Goal>) {
    super(createGoalFormControl(goal))
  }

  get title() { return this.controls.title }
  get description() { return this.controls.description }
  get deadline() { return this.controls.deadline }
  get publicity() { return this.controls.publicity }
  get image() { return this.controls.image }
  get categories() { return this.controls.categories }

  getGoalValue(): Partial<Goal> {
    const { description, image, deadline, publicity, title, categories } = this.value

    return {
      description,
      title,
      image,
      deadline,
      publicity,
      categories
    }
  }
}