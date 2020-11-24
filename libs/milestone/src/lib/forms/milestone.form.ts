import { FormControl } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form';
import { createMilestone, createMilestoneLink, Milestone, MilestoneLink } from "../+state/milestone.firestore";
import { ProfileLinkForm } from '@strive/user/user/forms/user.form'

function createMilestoneFormControl(params: Milestone) {
  const milestone = createMilestone(params)
  return {
    sequenceNumber: new FormControl(params.sequenceNumber),
    description: new FormControl(params.sequenceNumber),
    status: new FormControl(params.status),
    deadline: new FormControl(params.deadline),
    achiever: new ProfileLinkForm(params.achiever)
  }
}

export type MilestoneFormControl = ReturnType<typeof createMilestoneFormControl>

export class MilestoneForm extends FormEntity<MilestoneFormControl> {
  constructor(milestone?: Milestone) {
    super(createMilestoneFormControl(milestone))
  }

  get sequenceNumber() { return this.get('sequenceNumber') }
  get description() { return this.get('description') }
  get deadline() { return this.get('deadline') }
  get achiever() { return this.get('achiever') }
}

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