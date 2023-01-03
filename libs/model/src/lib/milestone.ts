import { User } from '@strive/model'
import { endOfDay } from 'date-fns'

export type MilestoneStatus = 'pending' | 'succeeded' | 'failed'

export interface Subtask {
  completed: boolean
  content: string
}

export interface Milestone {
  id?: string
  order: number
  content: string
  description: string
  status: MilestoneStatus
  deadline: Date
  achieverId: string
  achiever?: User // joined data
  subtasks: Subtask[]
  deletedAt: null | Date
  updatedBy?: string
  updatedAt?: Date 
  createdAt?: Date
  finishedAt?: Date
}

/** A factory function that creates a MilestoneDocument. */
export function createMilestone(params: Partial<Milestone> = {}): Milestone {
  const milestone: Milestone = {
    id: params.id ?? '',
    order: params.order ?? 0,
    content: params.content ?? '',
    description: params.description ?? '',
    deadline: params.deadline ? endOfDay(new Date(params.deadline)) : endOfDay(new Date()),
    status: params.status ?? 'pending',
    achieverId: params.achieverId ?? '',
    subtasks: params.subtasks ?? [],
    deletedAt: params.deletedAt ?? null
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
