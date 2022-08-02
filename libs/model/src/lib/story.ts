import { GoalSource } from './goal'
import { enumEvent } from './notification'

export const storyEvents: enumEvent[] = [
  enumEvent.gNewBucketlist,
  enumEvent.gNewActive,
  enumEvent.gNewFinished,
  enumEvent.gFinished,
  enumEvent.gMilestoneCompletedSuccessfully,
  enumEvent.gMilestoneCompletedUnsuccessfully,
  enumEvent.gMilestoneDeadlinePassed,
  enumEvent.gStakeholderAchieverAdded,
  enumEvent.gStakeholderAdminAdded,
  enumEvent.gRoadmapUpdated,
  enumEvent.gNewPost,
  enumEvent.gSupportAdded
]

export interface StoryItem {
  id?: string
  name: enumEvent
  date: Date
  source: GoalSource
  createdAt: Date
  updatedAt: Date
}