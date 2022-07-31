import { createUserLink, UserLink } from '@strive/user/user/+state/user.firestore';
import { setDateToEndOfDay } from '@strive/utils/helpers';

export type MilestoneStatus = 
  'pending'
  | 'succeeded' // milestone succesful
  | 'failed' // milestone failed
  | 'overdue'

export interface Milestone {
  id?: string;
  sequenceNumber: string;
  order: number;
  content: string;
  description: string;
  numberOfCustomSupports: number;
  numberOfMoneySupports: number;
  status: MilestoneStatus
  deadline: string;
  achiever: UserLink;
  subtasks: Subtask[];
  updatedBy?: string;
  updatedAt?: any; // TODO give type FieldValue / Date / Timestamp 
  createdAt?: any;
  finishedAt?: any;
}

export interface Subtask {
  completed: boolean;
  content: string;
}
export interface MilestonesLeveled extends Milestone {
  submilestones?: MilestoneLevelTwo[];
}

interface MilestoneLevelTwo extends Milestone {
  submilestones?: Milestone[];
}

export interface MilestoneLink {
  id: string;
  content: string;
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
    id: params.id ? params.id : '',
    order: 0,
    content: '',
    sequenceNumber: '',
    description: '',
    deadline: params.deadline ? setDateToEndOfDay(params.deadline) : '',
    numberOfCustomSupports: 0,
    numberOfMoneySupports: 0,
    status: 'pending',
    achiever: createUserLink(params.achiever),
    subtasks: [],
    ...params
  }
}

export function createMilestoneLink(params: Partial<MilestoneLink | Milestone> = {}): MilestoneLink {
  return {
    id: params.id ?? '',
    content: params.content ?? '',
  }
}

export function createSubtask(params: Partial<Subtask> = {}): Subtask {
  return {
    content: '',
    completed: false,
    ...params
  }
}

/** A factory function that creates a MilestoneTemplate Object. */
export function createMilestoneTemplate(params: Partial<MilestoneTemplate> = {}): MilestoneTemplate {
  return {
    id: params.id ? params.id : '',
    deadline: '',
    description: '',
    sequenceNumber: '1',
    ...params
  }
}