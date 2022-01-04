import { FormControl } from '@angular/forms';
import { FormEntity } from '@strive/utils/form/entity.form';
import { createSupport, Support } from '../+state/support.firestore';
import { GoalLinkForm } from '@strive/goal/goal/forms/goal.form';
import { UserLinkForm } from '@strive/user/user/forms/user.form';
import { MilestoneLinkForm } from '@strive/goal/milestone/forms/milestone.form';

function createSupportFormControl(params?: Support) {
  const support = createSupport(params);
  return {
    description: new FormControl(support.description),
    status: new FormControl(support.status),
    goal: new GoalLinkForm(support.goal),
    milestone: new MilestoneLinkForm(support.milestone),
    supporter: new UserLinkForm(support.supporter),
    receiver: new UserLinkForm(support.receiver)
  }
}

export type SupportFormControl = ReturnType<typeof createSupportFormControl>

export class SupportForm extends FormEntity<SupportFormControl> {
  constructor(support?: Support) {
    super(createSupportFormControl(support))
  }

  get description() { return this.get('description') }
  get goal() { return this.get('goal') }
  get milestone() { return this.get('milestone') }
  get supporter() { return this.get('supporter') }
  get receiver() { return this.get('receiver') }
}
