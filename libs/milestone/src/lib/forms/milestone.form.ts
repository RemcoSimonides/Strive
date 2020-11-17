import { FormControl } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form';
import { createMilestoneLink, MilestoneLink } from "../+state/milestone.firestore";

function createMilestoneLinkFormControl(params?: MilestoneLink) {
  const milestoneLink = createMilestoneLink(params)
  return {
    id: new FormControl(milestoneLink.id),
    description: new FormControl(milestoneLink.description)
  }
}

export type MilestoneLinkFormControl = ReturnType<typeof createMilestoneLinkFormControl>

export class MilestoneLinkForm extends FormEntity<MilestoneLinkFormControl> {
  constructor(milestoneLink?: MilestoneLink) {
    super(createMilestoneLinkFormControl(milestoneLink))
  }

  get id() { return this.get('id') }
  get description() { return this.get('description') }
}