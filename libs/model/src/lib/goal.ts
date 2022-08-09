import { enumEvent } from './notification';
import { createSupportLink, Support, SupportLink } from './support';
import { createUserLink, User, UserLink } from './user';
import { createMilestoneLink, Milestone, MilestoneLink } from './milestone';

export type GoalPublicityType = 'public' | 'private'
export type GoalStatus = 'bucketlist' | 'active' | 'finished'

export interface GoalEvent {
  name: enumEvent
  source: GoalSource
  createdAt?: Date
  updatedAt?: Date
}

export interface GoalSource {
  goal: GoalLink
  user?: UserLink
  milestone?: MilestoneLink
  postId?: string
  support?: SupportLink
  comment?: Comment
}

export interface Goal {
  id: string
  title: string
  description: string
  image: string
  status: GoalStatus
  publicity: GoalPublicityType
  numberOfAchievers: number
  numberOfSupporters: number
  numberOfCustomSupports: number
  totalNumberOfCustomSupports: number
  deadline?: string
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface GoalLink {
  id: string
  title: string
  image: string
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

export function createGoalEvent(params: GoalEvent): GoalEvent {
  return {
    ...params,
    source: createGoalSource(params.source),
  }
}

export function createGoalSource(params: {
  goal?: GoalLink | Goal
  milestone?: MilestoneLink | Milestone
  user?: UserLink | User
  postId?: string
  support?: SupportLink | Support
} = {}): GoalSource {
  const source: GoalSource = {
    goal: createGoalLink(params.goal)
  }

  if (params.user?.uid) source.user = createUserLink(params.user)
  if (params.milestone?.id) source.milestone = createMilestoneLink(params.milestone)
  if (params.postId) source.postId = params.postId
  if (params.support) source.support = createSupportLink(params.support)

  return source
}