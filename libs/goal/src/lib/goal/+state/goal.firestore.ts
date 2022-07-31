import { AudienceType } from '@strive/discussion/+state/discussion.firestore';
import { createGoalSource, enumEvent, GoalSource } from '@strive/notification/+state/notification.firestore';

export type GoalPublicityType = 'public' | 'private'
export type GoalStatus = 'bucketlist' | 'active' | 'finished'

/** For discussion */
export function getAudience(publicity: GoalPublicityType): AudienceType {
  return publicity === 'public'
    ? 'public'
    : 'team'
}

export interface GoalEvent {
  name: enumEvent
  source: GoalSource
  createdAt?: Date
  updatedAt?: Date
}

export interface Goal {
  id?: string;
  title: string;
  description: string;
  image: string;
  status: GoalStatus;
  publicity: GoalPublicityType;
  numberOfAchievers: number;
  numberOfSupporters: number;
  numberOfCustomSupports: number;
  totalNumberOfCustomSupports: number;
  deadline?: string;
  updatedBy?: string;
  updatedAt?: Date;
  createdAt?: Date;
}

export interface GoalLink {
  id: string;
  title: string;
  image: string;
}

/** A factory function that creates a GoalDocument. */
export function createGoal(params: Partial<Goal> = {}): Goal {
  return {
    id: params.id ? params.id : '',
    description: '',
    image: '',
    status: 'bucketlist',
    numberOfAchievers: 0,
    numberOfCustomSupports: 0,
    numberOfSupporters: 0,
    publicity: 'public',
    title: '',
    totalNumberOfCustomSupports: 0,
    ...params,
  }
}

export function createGoalLink(params: Partial<GoalLink | Goal> = {}): GoalLink {
  return {
    id: params.id ?? '',
    title: params.title ?? '',
    image: params.image ?? ''
  }
}

export function createGoalEvent(params: Partial<GoalEvent> = {}): GoalEvent {
  return {
    name: params.name,
    ...params,
    source: createGoalSource(params.source),
  }
}