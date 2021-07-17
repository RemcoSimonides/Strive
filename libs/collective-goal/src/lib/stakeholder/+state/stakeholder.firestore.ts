import { FieldValue } from '@firebase/firestore-types';

export interface CollectiveGoalStakeholder {
  id?: string;
  uid: string;
  username: string;
  photoURL: string;
  isAdmin: boolean;
  isAchiever: boolean;
  isSpectator: boolean;
  collectiveGoalId: string;
  collectiveGoalTitle: string;
  collectiveGoalIsPublic: boolean;
  updatedBy?: string;
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}

/** A factory function that creates a CollectiveGoalStakeholderDocument */
export function createCollectiveGoalStakeholder(params: Partial<CollectiveGoalStakeholder> = {}): CollectiveGoalStakeholder {
  return {
    id: !!params.id ? params.id : '',
    uid: '',
    username: '',
    photoURL: '',
    isAdmin: false,
    isAchiever: false,
    isSpectator: false,
    collectiveGoalId: '',
    collectiveGoalIsPublic: false,
    collectiveGoalTitle: '',
    ...params
  }
}