import { FieldValue } from '@firebase/firestore-types';

export interface IMilestone {
    id?: string;
    sequenceNumber: string;
    description: string;
    numberOfCustomSupports: number;
    numberOfMoneySupports: number;
    status: enumMilestoneStatus;
    deadline: string;
    achieverId?: string;
    achieverUsername?: string;
    achieverPhotoURL?: string;
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

export interface IMilestoneTemplabeObject {
    id: string;
    description: string;
    sequenceNumber: string;
    deadline: string;
    numberOfDotsInSequenceNumber?: number;
}

export interface IMilestonesLeveled {
    id?: string;
    sequenceNumber: string;
    description: string;
    numberOfCustomSupports: number;
    numberOfMoneySupports: number;
    status: enumMilestoneStatus;
    deadline: string;
    achieverId?: string;
    achieverUsername?: string;
    achieverPhotoURL?: string;
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
    milestonesLevelTwo?: IMilestonesLevelTwo[];
}

interface IMilestonesLevelTwo {
    id?: string;
    sequenceNumber: string;
    description: string;
    numberOfCustomSupports: number;
    numberOfMoneySupports: number;
    status: enumMilestoneStatus;
    deadline: string;
    achieverId?: string;
    achieverUsername?: string;
    achieverPhotoURL?: string;
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
    milestonesLevelThree?: IMilestonesLevelThree[];
}

interface IMilestonesLevelThree {
    id?: string;
    sequenceNumber: string;
    description: string;
    numberOfCustomSupports: number;
    numberOfMoneySupports: number;
    status: enumMilestoneStatus;
    deadline: string;
    achieverId?: string;
    achieverUsername?: string;
    achieverPhotoURL?: string;
    updatedAt?: FieldValue;
    createdAt?: FieldValue;
}

/**
 * Milestone
 */
export enum enumMilestoneStatus {
    pending,
    succeeded,
    failed,
    neutral,
    overdue,
}
