import { FormControl } from '@angular/forms';
import { FormEntity } from '@strive/utils/form/entity.form';
import { createSupport, Support } from '../+state/support.firestore';
import { GoalLinkForm } from '@strive/goal/goal/forms/goal.form';
import { ProfileLinkForm } from '@strive/user/user/forms/user.form';
import { MilestoneLinkForm } from '@strive/milestone/forms/milestone.form';

function createSupportFormControl(params?: Support) {
  const support = createSupport(params);
  return {
    description: new FormControl(support.description),
    status: new FormControl(support.status),
    goal: new GoalLinkForm(support.goal),
    milestone: new MilestoneLinkForm(support.milestone),
    path: new FormEntity({
      level1id: new FormControl(support.path.level1id),
      level1description: new FormControl(support.path.level1description),
      level2id: new FormControl(support.path.level2id),
      level2description: new FormControl(support.path.level2description),
      level3id: new FormControl(support.path.level3id),
      level3description: new FormControl(support.path.level3description),
    }),
    supporter: new ProfileLinkForm(support.supporter),
    receiver: new ProfileLinkForm(support.receiver)
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
  get path() { return this.get('path') }
}
