import { GoalPublicityType, GoalStatus } from './goal'

export type GoalStakeholderRole = 'isAdmin' | 'isAchiever' | 'isSupporter' | 'isSpectator'

export interface GoalStakeholder {
  uid: string
  username: string
  photoURL: string
  isAdmin: boolean
  isAchiever: boolean
  isSupporter: boolean
  isSpectator: boolean
  hasOpenRequestToJoin: boolean
  status: GoalStatus
  goalId: string
  goalPublicity: GoalPublicityType
  lastCheckedGoal: false | Date
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

/** A factory function that creates a GoalStakeholderDocument */
export function createGoalStakeholder(params: Partial<GoalStakeholder> = {}): GoalStakeholder {
  return {
    uid: params.uid ? params.uid : '',
    username: '',
    photoURL: '',
    isAdmin: false,
    isAchiever: false,
    isSpectator: false,
    isSupporter: false,
    hasOpenRequestToJoin: false,
    status: 'bucketlist',
    goalId: '',
    goalPublicity: 'private',
    lastCheckedGoal: false,
    ...params
  }
}

export function isOnlySpectator(stakeholder: GoalStakeholder) {
  const { isSpectator, isAchiever, isAdmin, isSupporter } = stakeholder
  return isSpectator && !(isAchiever || isAdmin || isSupporter)
}