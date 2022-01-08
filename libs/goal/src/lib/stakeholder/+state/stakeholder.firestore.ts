import { FieldValue } from '@firebase/firestore-types';
import { GoalPublicityType, GoalStatus } from '@strive/goal/goal/+state/goal.firestore';

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
  updatedBy?: string;
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
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
    ...params
  }
}
