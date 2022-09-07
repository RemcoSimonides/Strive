import { GoalPublicityType } from './goal'

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
  goalId: string
  goalPublicity: GoalPublicityType
  lastCheckedGoal: Date
  lastCheckedChat: Date
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
    goalId: '',
    goalPublicity: 'private',
    lastCheckedGoal: new Date(),
    lastCheckedChat: new Date(),
    ...params
  }
}
