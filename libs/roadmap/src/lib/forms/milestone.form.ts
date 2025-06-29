import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms'
import { createMilestone, createSubtask, Milestone, Subtask } from '@strive/model'

function createMilestoneFormControl(params: Partial<Milestone> = {}) {
  const milestone = createMilestone(params)
  const subtaskControls = milestone.subtasks.map(subtask => new SubtaskForm(subtask))
  return {
    order: new FormControl(milestone.order, { nonNullable: true, validators: [Validators.required]}),
    content: new FormControl(milestone.content, { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)]}),
    description: new FormControl(milestone.description, { nonNullable: true, validators: [Validators.maxLength(200)] }),
    status: new FormControl(milestone.status, { nonNullable: true }),
    deadline: new FormControl(milestone.deadline, { nonNullable: true }),
    subtasks: new FormArray<SubtaskForm>(subtaskControls ?? [])
  }
}

export type MilestoneFormControl = ReturnType<typeof createMilestoneFormControl>

export class MilestoneForm extends FormGroup<MilestoneFormControl> {
  constructor(milestone?: Milestone) {
    super(createMilestoneFormControl(milestone))
  }

  get order() { return this.controls.order }
  get content() { return this.controls.content }
  get description() { return this.controls.description }
  get deadline() { return this.controls.deadline }
  get subtasks() { return this.controls.subtasks }
}

function createSubtaskFormControl(params?: Partial<Subtask>) {
  const subtask = createSubtask(params)
  return {
    content: new FormControl(subtask.content, { nonNullable: true, validators: [Validators.required] }),
    completed: new FormControl(subtask.completed, { nonNullable: true })
  }
}

type SubtaskFormControl = ReturnType<typeof createSubtaskFormControl>
export class SubtaskForm extends FormGroup<SubtaskFormControl> {
  constructor(subtask?: Partial<Subtask>) {
    super(createSubtaskFormControl(subtask))
  }

  get content() { return this.controls.content }
  get completed() { return this.controls.completed }
}
