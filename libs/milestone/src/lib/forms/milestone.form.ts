import { FormControl, Validators } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form';
import { createMilestone, createMilestoneLink, createMilestoneTemplate, Milestone, MilestoneLink, MilestoneTemplate } from "../+state/milestone.firestore";
import { UserLinkForm } from '@strive/user/user/forms/user.form'

function createMilestoneFormControl(params: Milestone) {
  const milestone = createMilestone(params)
  return {
    sequenceNumber: new FormControl(milestone.sequenceNumber, Validators.required),
    order: new FormControl(milestone.order, Validators.required),
    content: new FormControl(milestone.content, Validators.required),
    description: new FormControl(milestone.description),
    status: new FormControl(milestone.status),
    deadline: new FormControl(milestone.deadline),
    achiever: new UserLinkForm(milestone.achiever)
  }
}

export type MilestoneFormControl = ReturnType<typeof createMilestoneFormControl>

export class MilestoneForm extends FormEntity<MilestoneFormControl> {
  constructor(milestone?: Milestone) {
    super(createMilestoneFormControl(milestone))
  }

  get sequenceNumber() { return this.get('sequenceNumber') }
  get order() { return this.get('order') }
  get content() { return this.get('content') }
  get description() { return this.get('description') }
  get deadline() { return this.get('deadline') }
  get achiever() { return this.get('achiever') }
}

function createMilestoneLinkFormControl(params?: MilestoneLink) {
  const milestoneLink = createMilestoneLink(params)
  return {
    id: new FormControl(milestoneLink.id),
    content: new FormControl(milestoneLink.content)
  }
}

export type MilestoneLinkFormControl = ReturnType<typeof createMilestoneLinkFormControl>

export class MilestoneLinkForm extends FormEntity<MilestoneLinkFormControl> {
  constructor(milestoneLink?: MilestoneLink) {
    super(createMilestoneLinkFormControl(milestoneLink))
  }

  get id() { return this.get('id') }
  get content() { return this.get('content') }
}

function createMilestoneTemplateFormControl(params?: Partial<MilestoneTemplate>) {
  const milestone = createMilestoneTemplate(params)
  return {
    id: new FormControl(milestone.id),
    deadline: new FormControl(milestone.deadline),
    description: new FormControl(milestone.description),
    sequenceNumber: new FormControl(milestone.sequenceNumber)
  }
}

export type MilestoneTemplateFormControl = ReturnType<typeof createMilestoneTemplateFormControl>

export class MilestoneTemplateForm extends FormEntity<MilestoneTemplateFormControl> {
  constructor(milestoneTemplate?: Partial<MilestoneTemplate>) {
    super(createMilestoneTemplateFormControl(milestoneTemplate))
  }

  get id() { return this.get('id') }
  get deadline() { return this.get('deadline') }
  get description() { return this.get('description') }
  get sequenceNumber() { return this.get('sequenceNumber') }

  incrementSeqNo(delta: -1 | 1) {
    const elements = this.sequenceNumber.value.split('.')
    const last = elements.pop()
    elements.push((+last + delta).toString())
    this.sequenceNumber.setValue(elements.join('.'))
  }
}