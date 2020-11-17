
import { FieldValue } from '@firebase/firestore-types';

export interface Milestone {
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

export interface MilestoneTemplabeObject {
    id: string;
    description: string;
    sequenceNumber: string;
    deadline: string;
    numberOfDotsInSequenceNumber?: number;
}

export interface MilestonesLeveled {
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
    milestonesLevelTwo?: MilestonesLevelTwo[];
}

interface MilestonesLevelTwo {
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
    milestonesLevelThree?: MilestonesLevelThree[];
}

interface MilestonesLevelThree {
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

export interface MilestoneLink {
  id: string;
  description: string;
}

/**
 * Milestone
 */
export enum enumMilestoneStatus {
    pending, // 
    succeeded, // milestone succesful
    failed, // milestone failed
    neutral, // didnt succeed and failed but no action was taken
    overdue, //
}


/** A factory function that creates a MilestoneDocument. */
export function createMilestone(params: Partial<Milestone> ={}): Milestone {
  return {
    id: !!params.id ? params.id : '',
    sequenceNumber: '',
    deadline: '',
    description: '',
    numberOfCustomSupports: 0,
    numberOfMoneySupports: 0,
    status: enumMilestoneStatus.pending,
    ...params
  }
}

export function createMilestoneLink(params: Partial<MilestoneLink> = {}): MilestoneLink {
  return {
    id: '',
    description: '',
    ...params
  }
}