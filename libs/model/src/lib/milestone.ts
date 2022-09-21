import { User } from '@strive/model'
import { setDateToEndOfDay } from '@strive/utils/helpers';

export type MilestoneStatus = 'pending' | 'succeeded' | 'failed' | 'overdue'

export interface Subtask {
  completed: boolean
  content: string
}

export interface Milestone {
  id?: string
  sequenceNumber: string
  order: number
  content: string
  description: string
  status: MilestoneStatus
  deadline: string
  achieverId: string
  achiever?: User // joined data
  subtasks: Subtask[]
  updatedBy?: string
  updatedAt?: Date 
  createdAt?: Date
  finishedAt?: Date
}

export interface MilestoneTemplate {
  id: string
  description: string
  sequenceNumber: string
  deadline: string
}

/** A factory function that creates a MilestoneDocument. */
export function createMilestone(params: Partial<Milestone> = {}): Milestone {
  const milestone: Milestone = {
    id: params.id ?? '',
    order: params.order ?? 0,
    content: params.content ?? '',
    sequenceNumber: params.sequenceNumber ?? '',
    description: params.description ?? '',
    deadline: params.deadline ? setDateToEndOfDay(params.deadline) : '',
    status: params.status ?? 'pending',
    achieverId: params.achieverId ?? '',
    subtasks: params.subtasks ?? [],
  }

  if (params.updatedBy) milestone.updatedBy = params.updatedBy
  if (params.updatedAt) milestone.updatedAt = params.updatedAt
  if (params.createdAt) milestone.createdAt = params.createdAt
  if (params.finishedAt) milestone.finishedAt = params.finishedAt

  return milestone
}

export function createSubtask(params: Partial<Subtask> = {}): Subtask {
  return {
    content: '',
    completed: false,
    ...params
  }
}
