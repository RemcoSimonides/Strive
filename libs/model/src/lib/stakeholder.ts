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
  focus: Focus
  goalId: string
  goalPublicity: GoalPublicityType
  lastCheckedGoal: Date
  lastCheckedChat: Date
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface Focus {
  on: boolean;
  why: string;
  inspiration: string;
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
    focus: createFocus(params.focus),
    goalId: '',
    goalPublicity: 'private',
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