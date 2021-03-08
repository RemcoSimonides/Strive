import { FieldValue } from '@firebase/firestore-types';
import { createProfileLink, ProfileLink } from '@strive/user/user/+state/user.firestore';
import { setDateToEndOfDay } from '@strive/utils/helpers';

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

export interface MilestoneTemplabeObject {
  id: string;
  description: string;
  sequenceNumber: string;
  deadline: string;
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

export type MilestoneStatus = 
  'pending'
  | 'succeeded' // milestone succesful
  | 'failed' // milestone failed
  | 'neutral' // didnt succeed and failed but no action was taken
  | 'overdue'

/** A factory function that creates a MilestoneDocument. */
export function createMilestone(params: Partial<Milestone> ={}): Milestone {
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
    id: '',
    description: '',
    ...params
  }
}

