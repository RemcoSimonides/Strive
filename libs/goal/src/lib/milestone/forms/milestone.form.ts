import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms'
import { createMilestone, createMilestoneLink, createSubtask, Milestone, MilestoneLink, Subtask } from '@strive/model'

function createMilestoneFormControl(params: Partial<Milestone> = {}) {
  const milestone = createMilestone(params)
  const subtaskControls = milestone.subtasks.map(subtask => new SubtaskForm(subtask))
  return {
    order: new FormControl(milestone.order, { nonNullable: true, validators: [Validators.required]}),
    content: new FormControl(milestone.content, { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)]}),
    description: new FormControl(milestone.description, { nonNullable: true, validators: [Validators.maxLength(200)] }),
    status: new FormControl(milestone.status, { nonNullable: true }),
    deadline: new FormControl(milestone.deadline, { nonNullable: true }),
    subtasks: new FormArray(subtaskControls ?? [])
  }
}

export type MilestoneFormControl = ReturnType<typeof createMilestoneFormControl>

export class MilestoneForm extends FormGroup<MilestoneFormControl> {
  constructor(milestone?: Milestone) {
    super(createMilestoneFormControl(milestone))
  }

  get order() { return this.get('order')! }
  get content() { return this.get('content')! }
  get description() { return this.get('description')! }
  get deadline() { return this.get('deadline')! }
  get subtasks() { return this.get('subtasks')! }
}

function createMilestoneLinkFormControl(params?: MilestoneLink) {
  const milestoneLink = createMilestoneLink(params)
  return {
    id: new FormControl(milestoneLink.id),
    content: new FormControl(milestoneLink.content)
  }
}

export type MilestoneLinkFormControl = ReturnType<typeof createMilestoneLinkFormControl>

export class MilestoneLinkForm extends FormGroup<MilestoneLinkFormControl> {
  constructor(milestoneLink?: MilestoneLink) {
    super(createMilestoneLinkFormControl(milestoneLink))
  }

  get id() { return this.get('id')! }
  get content() { return this.get('content')! }
}

function createSubtaskFormControl(params?: Subtask) {
  const subtask = createSubtask(params)
  return {
    content: new FormControl(subtask.content, { nonNullable: true, validators: [Validators.required] }),
    completed: new FormControl(subtask.completed, { nonNullable: true })
  }
}

type SubtaskFormControl = ReturnType<typeof createSubtaskFormControl>
export class SubtaskForm extends FormGroup<SubtaskFormControl> {
  constructor(subtask?: Subtask) {
    super(createSubtaskFormControl(subtask))
  }

  get content() { return this.get('content')! }
  get completed() { return this.get('completed')! }
}
