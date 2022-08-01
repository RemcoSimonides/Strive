import { GoalPublicityType, GoalStatus } from '@strive/model'

export interface GoalStakeholder {
  uid: string;
  username: string;
  photoURL: string;
  isAdmin: boolean;
  isAchiever: boolean;
  isSupporter: boolean;
  isSpectator: boolean;
  hasOpenRequestToJoin: boolean;
  status: GoalStatus;
  goalId: string;
  goalPublicity: GoalPublicityType;
  lastCheckedGoal: false | Date
  updatedBy?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export enum enumGoalStakeholder {
  admin = 'isAdmin',
  achiever = 'isAchiever',
  supporter = 'isSupporter',
  spectator = 'isSpectator'
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
