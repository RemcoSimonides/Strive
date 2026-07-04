import { GoalStakeholder } from './stakeholder'
import { GoalEvent } from './goal-event'
import { addYears, endOfYear, getMonth } from 'date-fns'
import { Category } from './categories'

export type StakeholderWithGoalAndEvents = GoalStakeholder & { goal: Goal, events: GoalEvent[] }
export type StakeholderWithGoal = GoalStakeholder & { goal: Goal }
export type GoalPublicityType = 'public' | 'private'

export interface GoalSource {
  goalId: string
  userId?: string
  milestoneId?: string
  postId?: string
  supportId?: string
  commentId?: string
}

export interface GoalLocation {
  lat: number
  lng: number
  name: string
}

export interface Goal {
  id: string
  title: string
  deadline: Date
  description: string
  image: string
  status: 'pending' | 'succeeded' | 'failed'
  categories: Category[]
  publicity: GoalPublicityType
  collectiveGoalId: string
  enableAssistant: boolean
  numberOfAchievers: number
  numberOfSupporters: number
  numberOfSpectators: number
  tasksCompleted: number
  tasksTotal: number
  location?: GoalLocation | null
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

export interface AlgoliaGoal {
  objectID?: string
  id: string
  title: string
  image: string
  categories: string[]
  numberOfAchievers: number
  numberOfSupporters: number
  _geoloc?: { lat: number, lng: number } | null
  locationName?: string | null
}

export function isFinished(goal: Goal) {
  if (goal.status !== 'pending') return true
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
  const date = new Date()
  const deadline = getMonth(date) < 6 ? endOfYear(date) : endOfYear(addYears(date, 1))

  return {
    id: params.id ? params.id : '',
    description: '',
    image: '',
    deadline,
    status: 'pending',
    categories: [],
    enableAssistant: true,
    numberOfAchievers: 0,
    numberOfSupporters: 0,
    numberOfSpectators: 0,
    tasksCompleted: 0,
    tasksTotal: 1,
    publicity: 'private',
    collectiveGoalId: '',
    title: '',
    ...params,
  }
}

export function createAlgoliaGoal(params: AlgoliaGoal | Goal): AlgoliaGoal {
  const _geoloc = '_geoloc' in params && params._geoloc
    ? { lat: params._geoloc.lat, lng: params._geoloc.lng }
    : 'location' in params && params.location
      ? { lat: params.location.lat, lng: params.location.lng }
      : null
  const locationName = ('locationName' in params
    ? params.locationName
    : 'location' in params
      ? params.location?.name
      : null) ?? null

  return {
    objectID: params.id,
    id: params.id,
    title: params.title,
    image: params.image,
    categories: params.categories,
    numberOfAchievers: params.numberOfAchievers,
    numberOfSupporters: params.numberOfSupporters,
    _geoloc,
    locationName
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
