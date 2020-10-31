import { FormControl, Validators } from '@angular/forms';
import { createCollectiveGoal, ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore'
import { FormEntity } from '@strive/utils/form/entity.form';

function createCollectiveGoalFormControl(params?: ICollectiveGoal) {
  const collectiveGoal = createCollectiveGoal(params);
  return {
    deadline: new FormControl(collectiveGoal.deadline),
    description: new FormControl(collectiveGoal.description),
    image: new FormControl(collectiveGoal.image),
    isOverdue: new FormControl(collectiveGoal.isOverdue),
    isPublic: new FormControl(collectiveGoal.isPublic, Validators.compose([Validators.required])),
    numberOfAchievers: new FormControl(collectiveGoal.numberOfAchievers),
    shortDescription: new FormControl(collectiveGoal.shortDescription),
    title: new FormControl(collectiveGoal.title, Validators.compose([Validators.required])),
  }
}

export type CollectiveGoalFormControl = ReturnType<typeof createCollectiveGoalFormControl>;

export class CollectiveGoalForm extends FormEntity<CollectiveGoalFormControl> {
  constructor(collectiveGoal?: ICollectiveGoal) {
    super(createCollectiveGoalFormControl(collectiveGoal))
  }
}
