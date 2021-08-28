import { Timestamp } from '@firebase/firestore-types';
import { MilestoneTemplate } from '@strive/milestone/+state/milestone.firestore'

export type GoalPublicityType = 'public' | 'collectiveGoalOnly' | 'private'

export interface Goal {
    id?: string;
    title: string;
    shortDescription: string;
    description: string;
    image: string;
    collectiveGoalId: string;
    roadmapTemplate: MilestoneTemplate[];
    isOverdue: boolean;
    isFinished: boolean;
    publicity: GoalPublicityType;
    numberOfAchievers: number;
    numberOfSupporters: number;
    numberOfCustomSupports: number;
    totalNumberOfCustomSupports: number;
    deadline?: string;
    updatedBy?: string;
    updatedAt?: Timestamp;
    createdAt?: Timestamp;
}

export interface GoalLink {
  id: string;
  title: string;
  image: string;
}

/** A factory function that creates a GoalDocument. */
export function createGoal(params: Partial<Goal> = {}): Goal {
  return {
    id: !!params.id ? params.id : '',
    description: '',
    image: '',
    isFinished: false,
    isOverdue: false,
    roadmapTemplate: [],
    numberOfAchievers: 0,
    numberOfCustomSupports: 0,
    numberOfSupporters: 0,
    publicity: 'public',
    shortDescription: '',
    title: '',
    totalNumberOfCustomSupports: 0,
    collectiveGoalId: '',
    ...params,
  }
}

export function createGoalLink(params: Partial<GoalLink> = {}): GoalLink {
  return {
    id: params.id ?? '',
    title: params.title ?? '',
    image: params.image ?? ''
  }
}