import { Goal, Milestone, User } from '@strive/model'

export type SupportDecision = 'give' | 'keep'
export type SupportStatus = 'open' | 'rejected' | 'waiting_to_be_paid' | 'paid'

export interface SupportBase {
  id?: string
  description: string
  status: SupportStatus
  needsDecision: Date | false
  goalId: string
  milestoneId?: string
  supporterId: string
  recipientId: string
  updatedAt: Date
  createdAt: Date
}

export interface Support extends SupportBase {
  recipient?: User
  supporter?: User
  goal?: Goal
  milestone?: Milestone
}

export function createSupportBase(params: Partial<SupportBase> = {}): SupportBase {
  const support: SupportBase = {
    id: params.id ?? '',
    description: params.description ?? '',
    status: params.status ?? 'open',
    needsDecision: params.needsDecision ?? false,
    goalId: params.goalId ?? '',
    supporterId: params.supporterId ?? '',
    recipientId: params.recipientId ?? '',
    updatedAt: params.updatedAt ?? new Date(),
    createdAt: params.createdAt ?? new Date()
  }
  
  if (params.milestoneId) support.milestoneId = params.milestoneId

  return support
}