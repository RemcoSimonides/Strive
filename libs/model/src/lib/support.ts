import { Goal, Milestone, User } from '@strive/model'
import { unique } from '@strive/utils/helpers'

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

export type SupportsGroupedByMilestone = Milestone & { supports: Support[] }
export type SupportsGroupedByGoal = Goal & { milestones: SupportsGroupedByMilestone[], supports: Support[] }

export function groupByObjective(supports: Support[]): SupportsGroupedByGoal[] {

  const groups: SupportsGroupedByGoal[] = []

  const goalIds = unique(supports.map(support => support.goalId))
  for (const goalId of goalIds) {
    const supportsOfGoal = supports.filter(support => support.goalId === goalId).sort((a) => a.milestoneId ? 1 : -1)
    const supportsWithoutMilestone = supportsOfGoal.filter(support => !support.milestoneId)

    const group: SupportsGroupedByGoal = {
      ...supportsOfGoal[0].goal as Goal,
      supports: supportsWithoutMilestone,
      milestones: []
    }

    const milestoneIds = unique(supportsOfGoal.filter(support => support.milestoneId).map(support => support.milestoneId))
    for (const milestoneId of milestoneIds) {
      const supportsOfMilestone = supportsOfGoal.filter(support => support.milestoneId === milestoneId)
      const groupByMilestone: SupportsGroupedByMilestone = {
        ...supportsOfMilestone[0].milestone as Milestone,
        supports: supportsOfMilestone
      }
      group.milestones.push(groupByMilestone)
    }

    groups.push(group)
  }

  return groups
}