import { enumEvent } from '../+state/notification.firestore'
import { NotificationIcons } from './notification'

export interface AggregatedMessage {
  icon: NotificationIcons
  message: string
  important: boolean
}

export function getAggregatedMessage({ event, count }: { event: enumEvent, count: number }): AggregatedMessage {
  switch (event) {
    case enumEvent.gNewBucketlist:
    case enumEvent.gNewActive:
    case enumEvent.gNewFinished:
      break
    case enumEvent.gFinished:
      return {
        message: `Goal is finished!`,
        icon: 'flag-outline',
        important: true
      } 
    case enumEvent.gMilestoneCompletedSuccessfully:
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} completed successfully`,
        icon: 'checkmark-outline',
        important: false
      } 
    case enumEvent.gMilestoneCompletedUnsuccessfully:
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} completed unsuccessfully`,
        icon: 'close-outline',
        important: false
      }
    case enumEvent.gMilestoneDeadlinePassed:
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} passed their deadline`,
        icon: 'alert-outline',
        important: false
      }
    case enumEvent.gStakeholderAchieverAdded:
      return {
        message: `${count} ${count === 1 ? 'achiever' : 'achievers'} joined`,
        icon: 'person-add-outline',
        important: false
      }
    case enumEvent.gStakeholderAdminAdded:
      break
    case enumEvent.gRoadmapUpdated:
      break
    case enumEvent.gNewPost:
      return {
        message: `${count} ${count === 1 ? 'post' : 'posts'} created`,
        icon: 'bookmark-outline',
        important: false
      }
    case enumEvent.gSupportAdded: {
      return {
        message: `${count} ${count === 1 ? 'support' : 'supports'} added`,
        icon: 'heart-outline',
        important: false
      }
    }
    default:
      return undefined
  }
}
