import { FormArray, FormControl, Validators } from '@angular/forms'
import { FormEntity } from '@strive/utils/form/entity.form';
import { createMilestone, createMilestoneLink, createMilestoneTemplate, createSubtask, Milestone, MilestoneLink, MilestoneTemplate, Subtask } from '@strive/model'
import { UserLinkForm } from '@strive/user/user/forms/user.form'

function createMilestoneFormControl(params: Milestone) {
  const milestone = createMilestone(params)
  const subtaskControls = milestone.subtasks.map(subtask => new SubtaskForm(subtask))
  return {
    order: new FormControl(milestone.order, Validators.required),
    content: new FormControl(milestone.content, Validators.required),
    description: new FormControl(milestone.description),
    status: new FormControl(milestone.status),
    deadline: new FormControl(milestone.deadline),
    achiever: new UserLinkForm(milestone.achiever),
    subtasks: new FormArray(subtaskControls ?? [])
  }
}

export type MilestoneFormControl = ReturnType<typeof createMilestoneFormControl>

export class MilestoneForm extends FormEntity<MilestoneFormControl> {
  constructor(milestone?: Milestone) {
    super(createMilestoneFormControl(milestone))
  }

  get order() { return this.get('order') }
  get content() { return this.get('content') }
  get description() { return this.get('description') }
  get deadline() { return this.get('deadline') }
  get achiever() { return this.get('achiever') }
  get subtasks() { return this.get('subtasks') }
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

function createSubtaskFormControl(params?: Subtask) {
  const subtask = createSubtask(params)
  return {
    content: new FormControl(subtask.content, Validators.required),
    completed: new FormControl(subtask.completed)
  }
}

type SubtaskFormControl = ReturnType<typeof createSubtaskFormControl>
export class SubtaskForm extends FormEntity<SubtaskFormControl> {
  constructor(subtask?: Subtask) {
    super(createSubtaskFormControl(subtask))
  }

  get content() { return this.get('content') }
  get completed() { return this.get('completed') }
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