import { Goal, GoalPublicityType } from './goal'
import { User } from './user'

export type GoalStakeholderRole = 'isAdmin' | 'isAchiever' | 'isSupporter' | 'isSpectator'

export interface Roles {
  isAdmin: boolean
  isAchiever: boolean
  isSupporter: boolean
  isSpectator: boolean
}

export interface Stakeholder extends GoalStakeholder {
  profile?: User
  goal?: Goal
}

export interface GoalStakeholder extends Roles {
  uid: string
  hasOpenRequestToJoin: boolean
  hasInviteToJoin: boolean
  focus: Focus
  goalId: string
  goalPublicity: GoalPublicityType
  collectiveGoalId: string
  lastCheckedGoal: Date
  lastCheckedChat: Date
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface Focus {
  on: boolean
  why: string
  inspiration: string
}

/** A factory function that creates a GoalStakeholderDocument */
export function createGoalStakeholder(params: Partial<GoalStakeholder> = {}): GoalStakeholder {
  return {
    uid: params.uid ? params.uid : '',
    isAdmin: false,
    isAchiever: false,
    isSpectator: false,
    isSupporter: false,
    hasOpenRequestToJoin: false,
    hasInviteToJoin: false,
    focus: createFocus(params.focus),
    goalId: '',
    goalPublicity: 'private',
    collectiveGoalId: '',
    lastCheckedGoal: new Date(),
    lastCheckedChat: new Date(),
    ...params
  }
}

export function createFocus(focus?: Partial<Focus>): Focus {
  return {
    on: focus?.on ?? false,
    why: focus?.why ?? '',
    inspiration: focus?.inspiration ?? ''
  }
}