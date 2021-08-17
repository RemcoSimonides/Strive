import { FieldValue } from '@firebase/firestore-types';
import { createProfileLink, ProfileLink } from '@strive/user/user/+state/user.firestore';
import { setDateToEndOfDay } from '@strive/utils/helpers';

export type MilestoneStatus = 
  'pending'
  | 'succeeded' // milestone succesful
  | 'failed' // milestone failed
  | 'neutral' // didnt succeed or failed but no action was taken
  | 'overdue'

export interface Milestone {
  id?: string;
  sequenceNumber: string;
  description: string;
  numberOfCustomSupports: number;
  numberOfMoneySupports: number;
  status: MilestoneStatus
  deadline: string;
  achiever: ProfileLink;
  updatedAt?: FieldValue;
  createdAt?: FieldValue;
}
export interface MilestonesLeveled extends Milestone {
  submilestones?: MilestoneLevelTwo[];
}

interface MilestoneLevelTwo extends Milestone {
  submilestones?: Milestone[];
}

export interface MilestoneLink {
  id: string;
  description: string;
}
export interface MilestoneTemplate {
  id: string;
  description: string;
  sequenceNumber: string;
  deadline: string;
}
  

/** A factory function that creates a MilestoneDocument. */
export function createMilestone(params: Partial<Milestone> = {}): Milestone {
  return {
    id: !!params.id ? params.id : '',
    sequenceNumber: '',
    deadline: '',
    description: params.deadline ? setDateToEndOfDay(params.deadline) : '',
    numberOfCustomSupports: 0,
    numberOfMoneySupports: 0,
    status: 'pending',
    achiever: createProfileLink(params.achiever),
    ...params
  }
}

export function createMilestoneLink(params: Partial<MilestoneLink> = {}): MilestoneLink {
  return {
    id: params.id ?? '',
    description: params.description ?? '',
  }
}

/** A factory function that creates a MilestoneTemplate Object. */
export function createMilestoneTemplate(params: Partial<MilestoneTemplate> = {}): MilestoneTemplate {
  return {
    id: !!params.id ? params.id : '',
    deadline: '',
    description: '',
    sequenceNumber: '',
    ...params
  }
}