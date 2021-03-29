import { FormControl, Validators } from '@angular/forms';
import { createCollectiveGoal, CollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore'
import { FormEntity } from '@strive/utils/form/entity.form';

function createCollectiveGoalFormControl(params?: CollectiveGoal) {
  const collectiveGoal = createCollectiveGoal(params);
  return {
    deadline: new FormControl(collectiveGoal.deadline),
    description: new FormControl(collectiveGoal.description),
    image: new FormControl(collectiveGoal.image),
    isOverdue: new FormControl(collectiveGoal.isOverdue),
    isPublic: new FormControl(collectiveGoal.isPublic, Validators.required),
    numberOfAchievers: new FormControl(collectiveGoal.numberOfAchievers),
    shortDescription: new FormControl(collectiveGoal.shortDescription),
    title: new FormControl(collectiveGoal.title, Validators.required),
  }
}

export type CollectiveGoalFormControl = ReturnType<typeof createCollectiveGoalFormControl>;

export class CollectiveGoalForm extends FormEntity<CollectiveGoalFormControl> {
  constructor(collectiveGoal?: CollectiveGoal) {
    super(createCollectiveGoalFormControl(collectiveGoal))
  }

  get image() { return this.get('image') }
}
