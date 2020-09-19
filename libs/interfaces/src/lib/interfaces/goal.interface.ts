import { Timestamp } from '@firebase/firestore-types';
import { IMilestoneTemplabeObject } from './milestone.interface';

export interface IGoal {
    id?: string;
    title: string;
    shortDescription: string;
    description: string;
    image: string;
    collectiveGoal?: {
        id: string;
        title: string;
        image: string;
        isPublic: boolean;
    };
    milestoneTemplateObject: IMilestoneTemplabeObject[];
    isOverdue: boolean;
    isFinished: boolean;
    isLocked: boolean;
    publicity: enumGoalPublicity;
    numberOfAchievers: number;
    numberOfSupporters: number;
    numberOfCustomSupports: number;
    totalNumberOfCustomSupports: number;
    deadline?: string;
    updatedAt?: Timestamp;
    createdAt?: Timestamp;
}

// Creates a default goal object
export class EmptyGoal implements IGoal {
    id = '';
    title = '';
    shortDescription = '';
    description = '';
    image = '';
    collectiveGoal = {
        id: '',
        title: '',
        image: '',
        isPublic: false
    };
    numberOfAchievers = 0;
    numberOfSupporters = 0;
    numberOfCustomSupports = 0;
    totalNumberOfCustomSupports = 0;
    milestoneTemplateObject = [];
    isOverdue = false;
    isFinished = false;
    isLocked = false;
    publicity = 0;
    deadline = undefined;
    updatedAt = undefined;
    createdAt = undefined;
}

export enum enumGoalPublicity {
    public,
    collectiveGoalOnly,
    private
}
