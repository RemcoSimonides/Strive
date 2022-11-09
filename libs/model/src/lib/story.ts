import { Milestone } from './milestone'
import { EventType } from './notification'
import { Post } from './post'
import { User } from './user'

export const storyEvents: EventType[] = [
  'goalCreated',
  'goalCreatedFinished',
  'goalIsFinished',
  'goalMilestoneCompletedSuccessfully',
  'goalMilestoneCompletedUnsuccessfully',
  'goalStakeholderBecameAchiever',
  'goalStakeholderBecameAdmin',
  'goalStoryPostCreated'
]

export interface StoryItemBase {
  id?: string
  name: EventType
  date: Date
  goalId: string
  userId?: string
  milestoneId?: string
  postId?: string
  createdAt: Date
  updatedAt: Date
}

export interface StoryItem extends StoryItemBase {
  user?: User
  milestone?: Milestone
  post?: Post
}


export function createStoryItemBase(params: Partial<StoryItemBase> = {}): StoryItemBase {
  const item: StoryItemBase = {
    name: params.name ?? '',
    date: params.date ?? new Date(),
    goalId: params.goalId ?? '',
    createdAt: params.createdAt ?? new Date(),
    updatedAt: params.updatedAt ?? new Date()
  }

  if (params.userId) item.userId = params.userId
  if (params.milestoneId) item.milestoneId = params.milestoneId
  if (params.postId) item.postId = params.postId

  return item
}