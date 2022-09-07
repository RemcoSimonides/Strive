import { EventType } from './notification';
import { createSupportLink, Support, SupportLink } from './support';
import { createUserLink, User, UserLink } from './user';
import { createMilestoneLink, Milestone, MilestoneLink } from './milestone';

export type GoalPublicityType = 'public' | 'private'

export interface GoalEvent {
  name: EventType
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
  isFinished: Date | boolean
  publicity: GoalPublicityType
  numberOfAchievers: number
  numberOfSupporters: number
  numberOfSpectators: number
  tasksCompleted: number
  tasksTotal: number
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

export interface AlgoliaGoal {
  objectID?: string
  id: string
  title: string
  image: string
  numberOfAchievers: number
  numberOfSupporters: number
}

export function isFinished(goal: Goal) {
  if (goal.isFinished) return true
  return goal.tasksCompleted === goal.tasksTotal
}

export function inProgress(goal: Goal) {
  return goal.tasksCompleted > 0 && !isFinished(goal)
}

export function inBucketlist(goal: Goal) {
  return goal.tasksCompleted === 0 && !isFinished(goal)
}

/** A factory function that creates a GoalDocument. */
export function createGoal(params: Partial<Goal> = {}): Goal {
  return {
    id: params.id ? params.id : '',
    description: '',
    image: '',
    isFinished: false,
    numberOfAchievers: 0,
    numberOfSupporters: 0,
    numberOfSpectators: 0,
    tasksCompleted: 0,
    tasksTotal: 1,
    publicity: 'public',
    title: '',
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

export function createAlgoliaGoal(params: AlgoliaGoal | Goal): AlgoliaGoal {
  return {
    objectID: params.id,
    id: params.id,
    title: params.title,
    image: params.image,
    numberOfAchievers: params.numberOfAchievers,
    numberOfSupporters: params.numberOfSupporters
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