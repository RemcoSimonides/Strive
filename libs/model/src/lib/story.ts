import { createGoalSource, GoalSource } from './goal'
import { EventType } from './notification'

export const storyEvents: EventType[] = [
  'goalCreatedStatusBucketlist',
  'goalCreatedStatusActive',
  'goalCreatedStatusFinished',
  'goalStatusFinished',
  'goalMilestoneCompletedSuccessfully',
  'goalMilestoneCompletedUnsuccessfully',
  'goalMilestoneDeadlinePassed',
  'goalStakeholderBecameAchiever',
  'goalStakeholderBecameAdmin',
  'goalStoryPostCreated'
]

export interface StoryItem {
  id?: string
  name: EventType
  date: Date
  source: GoalSource
  createdAt: Date
  updatedAt: Date
}

export function createStoryItem(params: Partial<StoryItem> = {}): StoryItem {
  return {
    name: '',
    date: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...params,
    source: createGoalSource(params.source),
  }
}