import { FieldValue } from '@firebase/firestore-types';

export interface ICollectiveGoalStakeholder {
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
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

export enum enumCollectiveGoalStakeholder {
    admin = 'isAdmin',
    achiever = 'isAchiever',
    spectator = 'isSpectator'
}
