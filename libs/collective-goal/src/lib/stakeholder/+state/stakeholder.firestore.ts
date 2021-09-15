import { FieldValue } from '@firebase/firestore-types';

export interface CollectiveGoalStakeholder {
  uid: string;
  username: string;
  photoURL: string;
  isAdmin: boolean;
  isAchiever: boolean;
  isSpectator: boolean;
  collectiveGoalId: string;
  collectiveGoalTitle: string;
  collectiveGoalIsSecret: boolean;
  updatedBy?: string;
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

/** A factory function that creates a CollectiveGoalStakeholderDocument */
export function createCollectiveGoalStakeholder(params: Partial<CollectiveGoalStakeholder> = {}): CollectiveGoalStakeholder {
  return {
    uid: '',
    username: '',
    photoURL: '',
    isAdmin: false,
    isAchiever: false,
    isSpectator: false,
    collectiveGoalId: '',
    collectiveGoalIsSecret: false,
    collectiveGoalTitle: '',
    ...params
  }
}