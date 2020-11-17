import { Timestamp } from '@firebase/firestore-types';
import { IMilestoneTemplabeObject } from '@strive/interfaces';

export type GoalPublicityType = 'public' | 'collectiveGoalOnly' | 'private'

export interface Goal {
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
    publicity: GoalPublicityType;
    numberOfAchievers: number;
    numberOfSupporters: number;
    numberOfCustomSupports: number;
    totalNumberOfCustomSupports: number;
    deadline?: string;
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
    isLocked: false,
    isOverdue: false,
    milestoneTemplateObject: [],
    numberOfAchievers: 0,
    numberOfCustomSupports: 0,
    numberOfSupporters: 0,
    publicity: 'public',
    shortDescription: '',
    title: '',
    totalNumberOfCustomSupports: 0,
    ...params,
    collectiveGoal: {
      id: params.collectiveGoal?.id ?? '',
      image: params.collectiveGoal?.image ?? '',
      isPublic: params.collectiveGoal.isPublic ?? false,
      title: params.collectiveGoal?.title ?? ''
    },
  }
}

export function createGoalLink(params: Partial<GoalLink> = {}): GoalLink {
  return {
    id: '',
    title: '',
    image: '',
    ...params
  }
}