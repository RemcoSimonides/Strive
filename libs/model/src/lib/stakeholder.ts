import { Goal, GoalPublicityType } from './goal'
import { GoalSettings, createGoalSettings } from './settings'
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
  priority: number
  goalId: string
  goalPublicity: GoalPublicityType
  collectiveGoalId: string
  lastCheckedGoal: Date
  lastCheckedChat: Date
  settings: GoalSettings
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
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
    priority: -1,
    goalId: '',
    goalPublicity: 'private',
    collectiveGoalId: '',
    lastCheckedGoal: new Date(),
    lastCheckedChat: new Date(),
    settings: createGoalSettings(params.settings),
    ...params
  }
}
