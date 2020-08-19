import { FieldValue } from '@firebase/firestore-types';
import { enumGoalPublicity } from './goal.interface';

export interface IGoalStakeholder {
    id?: string;
    uid: string;
    username: string;
    photoURL: string;
    isAdmin: boolean;
    isAchiever: boolean;
    isSupporter: boolean;
    isSpectator: boolean;
    hasOpenRequestToJoin: boolean;
    goalId: string;
    goalTitle: string;
    goalImage: string;
    goalPublicity: enumGoalPublicity;
    goalIsFinished: boolean;
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

export enum enumGoalStakeholder {
    admin = 'isAdmin',
    achiever = 'isAchiever',
    supporter = 'isSupporter',
    spectator = 'isSpectator'
}

export class GoalStakeholder implements IGoalStakeholder {
    uid = '';
    username = '';
    photoURL = '';
    isAdmin = false;
    isAchiever = false;
    isSupporter = false;
    isSpectator = false;
    hasOpenRequestToJoin = false;
    goalId = '';
    goalTitle = '';
    goalImage = '';
    goalPublicity: enumGoalPublicity = enumGoalPublicity.private;
    goalIsFinished = false;
}
