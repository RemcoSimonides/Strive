import { GoalStakeholder } from './stakeholder'
import { GoalEvent } from './goal-event'

export type StakeholderWithGoalAndEvents = GoalStakeholder & { goal: Goal, events: GoalEvent[] }
export type GoalPublicityType = 'public' | 'private'

export interface GoalSource {
  goalId: string
  userId?: string
  milestoneId?: string
  postId?: string
  supportId?: string
  commentId?: string
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

export function createGoalSource(params: {
  goalId?: string
  milestoneId?: string
  userId?: string
  postId?: string
  supportId?: string
  commentId?: string
} = {}): GoalSource {
  const source: GoalSource = {
    goalId: params.goalId ?? ''
  }

  if (params.userId) source.userId = params.userId
  if (params.milestoneId) source.milestoneId = params.milestoneId
  if (params.postId) source.postId = params.postId
  if (params.supportId) source.supportId = params.supportId
  if (params.commentId) source.commentId = params.commentId

  return source
}