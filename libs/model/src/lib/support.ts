import { Goal, Milestone, User } from '@strive/model'
import { unique } from '@strive/utils/helpers'
import { compareDesc } from 'date-fns'

export type SupportDecision = 'give' | 'keep'
export type SupportStatus = 'open' | 'rejected' | 'accepted'

export interface SupportBase {
  id?: string
  description: string
  status: SupportStatus
  needsDecision: Date | false
  counterDescription: string
  counterNeedsDecision: Date | false
  counterStatus: SupportStatus
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
    counterDescription: params.counterDescription ?? '',
    counterNeedsDecision: params.counterNeedsDecision ?? false,
    counterStatus: params.counterStatus ?? 'open',
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

export function sortGroupedSupports(supports: SupportsGroupedByGoal[]): SupportsGroupedByGoal[] {
  for (const goal of supports) {
    goal.supports = sortSupports(goal.supports)
    for (const milestone of goal.milestones) {
      milestone.supports = sortSupports(milestone.supports)
    }
  }
  return supports
}

function sortSupports(supports: Support[]): Support[] {
  return supports
    .sort((a, b) => compareDesc(a.createdAt, b.createdAt))
    .sort((a, b) => {
      if (a.status === 'open' && b.status !== 'open') return -1
      if (a.status !== 'open' && b.status === 'open') return 1
      return 0
    })
}