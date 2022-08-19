import { createGoalLink, createMilestoneLink, createUserLink, Goal, GoalLink, Milestone, MilestoneLink, User, UserLink } from '@strive/model'

export type SupportDecision = 'give' | 'keep'
export type SupportStatus = 'open' | 'rejected' | 'waiting_to_be_paid' | 'paid'

export interface SupportLink {
  id: string
  description: string
}

export interface Support {
  id?: string
  amount?: number
  description: string
  status: SupportStatus
  needsDecision: Date | false
  source: SupportSource
  updatedAt?: Date
  createdAt?: Date
}

export interface SupportSource {
  goal: GoalLink
  milestone?: MilestoneLink
  supporter: UserLink
  recipient: UserLink
}


export function createSupport(params: Partial<Support> = {}): Support {
  return {
    id: '',
    description: '',
    status: 'open',
    needsDecision: false,
    source: createSupportSource(params.source),
    ...params
  }
}

export function createSupportLink(params: Partial<Support | SupportLink> = {}): SupportLink {
  return {
    id: params.id ?? '',
    description: params.description ?? ''
  }
}

export function createSupportSource(params: {
  goal?: GoalLink | Goal
  milestone?: MilestoneLink | Milestone
  supporter?: UserLink | User
  recipient?: UserLink | User
} = {}): SupportSource {
  const source: SupportSource = {
    goal: createGoalLink(params?.goal),
    supporter: createUserLink(params?.supporter),
    recipient: createUserLink(params?.recipient)
  }

  if (params?.milestone?.id) source.milestone = createMilestoneLink(params.milestone)

  return source
}