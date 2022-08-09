import { enumEvent, NotificationIcons } from '@strive/model'

export interface AggregatedMessage {
  icon: NotificationIcons
  message: string
  importance: number
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
        importance: 1
      }
    case enumEvent.gStakeholderRequestToJoinPending: {
      return {
        message: `${count} ${count === 1 ? 'request' : 'requests'} to join`,
        icon: 'person-add-outline',
        importance: 2
        }
      }
    case enumEvent.gNewPost:
      return {
        message: `${count} ${count === 1 ? 'post' : 'posts'} created`,
        icon: 'bookmark-outline',
        importance: 3
      }
    case enumEvent.gMilestoneCompletedSuccessfully:
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} completed successfully`,
        icon: 'checkmark-outline',
        importance: 4
      } 
    case enumEvent.gMilestoneCompletedUnsuccessfully:
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} completed unsuccessfully`,
        icon: 'close-outline',
        importance: 5
      }
    case enumEvent.gMilestoneDeadlinePassed:
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} passed their deadline`,
        icon: 'alert-outline',
        importance: 6
      }
    case enumEvent.gStakeholderAchieverAdded:
      return {
        message: `${count} ${count === 1 ? 'achiever' : 'achievers'} joined`,
        icon: 'person-add-outline',
        importance: 7
      }
    case enumEvent.gStakeholderAdminAdded:
      break
    case enumEvent.gRoadmapUpdated:
      break
    case enumEvent.gSupportAdded: {
      return {
        message: `${count} ${count === 1 ? 'support' : 'supports'} added`,
        icon: 'heart-outline',
        importance: 8
      }
    }
    default:
      return {
        message: '',
        icon: 'alert-outline',
        importance: 999
      }
  }
  return {
    message: '',
    icon: 'alert-outline',
    importance: 999
  }
}
