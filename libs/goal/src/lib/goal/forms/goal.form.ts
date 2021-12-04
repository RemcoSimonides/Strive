import { FormControl, Validators } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form';
import { createGoalLink, GoalLink, Goal, createGoal } from "../+state/goal.firestore";

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

function createGoalFormControl(params?: Goal) {
  const goal = createGoal(params);
  return {
    description: new FormControl(goal.description),
    image: new FormControl(goal.image),
    status: new FormControl(goal.status),
    deadline: new FormControl(goal.deadline),
    roadmapTemplate: new FormControl(goal.roadmapTemplate),
    numberOfAchievers: new FormControl(goal.numberOfAchievers),
    numberOfCustomSupports: new FormControl(goal.numberOfCustomSupports),
    numberOfSupporters: new FormControl(goal.numberOfSupporters),
    publicity: new FormControl(goal.publicity),
    isSecret: new FormControl(goal.publicity === 'private'),
    title: new FormControl(goal.title, Validators.required),
    totalNumberOfCustomSupports: new FormControl(goal.totalNumberOfCustomSupports),
    collectiveGoalId: new FormControl(goal.collectiveGoalId)
  }
}

export type GoalFormControl = ReturnType<typeof createGoalFormControl>

export class GoalForm extends FormEntity<GoalFormControl> {
  constructor(goal?: Goal) {
    super(createGoalFormControl(goal))
  }

  get title() { return this.get('title') }
  get description() { return this.get('description') }
  get publicity() { return this.get('publicity') }
  get collectiveGoalId() { return this.get('collectiveGoalId') }
  get image() { return this.get('image') }
}