import { Timestamp } from '@firebase/firestore-types';
import { MilestoneTemplate } from '@strive/milestone/+state/milestone.firestore'
import { AudienceType } from '@strive/discussion/+state/discussion.firestore';

export type GoalPublicityType = 'public' | 'collectiveGoalOnly' | 'private'
export type GoalStatus = 'bucketlist' | 'active' | 'finished'

/** For discussion */
export function getAudience(publicity: GoalPublicityType): AudienceType {
  return publicity === 'public'
    ? 'public'
    : publicity === 'collectiveGoalOnly'
      ? 'collectiveGoal'
      : 'team'
}

export interface Goal {
    id?: string;
    title: string;
    description: string;
    image: string;
    collectiveGoalId: string;
    roadmapTemplate: MilestoneTemplate[];
    isOverdue: boolean;
    status: GoalStatus;
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
    status: 'bucketlist',
    isOverdue: false,
    roadmapTemplate: [],
    numberOfAchievers: 0,
    numberOfCustomSupports: 0,
    numberOfSupporters: 0,
    publicity: 'public',
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