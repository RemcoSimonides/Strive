import { EventType, NotificationIcons } from '@strive/model'

export interface AggregatedMessage {
  icon: NotificationIcons
  message: string
  importance: number
}

export function getAggregatedMessage({ event, count }: { event: EventType, count: number }): AggregatedMessage | undefined {
  switch (event) {
    case 'goalCreated':
    case 'goalCreatedFinished':
      break
    case 'goalIsFinished':
      return {
        message: `Goal is finished!`,
        icon: 'flag-outline',
        importance: 1
      }
    case 'goalStakeholderRequestedToJoin': {
      return {
        message: `${count} ${count === 1 ? 'request' : 'requests'} to join`,
        icon: 'person-add-outline',
        importance: 2
        }
      }
    case 'goalStoryPostCreated':
      return {
        message: `${count} ${count === 1 ? 'post' : 'posts'} created`,
        icon: 'bookmark-outline',
        importance: 3
      }
    case 'goalMilestoneCompletedSuccessfully':
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} completed successfully`,
        icon: 'checkmark-outline',
        importance: 4
      } 
    case 'goalMilestoneCompletedUnsuccessfully':
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} completed unsuccessfully`,
        icon: 'close-outline',
        importance: 5
      }
    
    case 'goalMilestoneCreated': 
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} added`,
        icon: 'create-outline',
        importance: 6,
      }

    case 'goalMilestoneDeadlinePassed':
      return {
        message: `${count} ${count === 1 ? 'milestone' : 'milestones'} passed their deadline`,
        icon: 'alert-outline',
        importance: 7
      }
    case 'goalStakeholderBecameAchiever':
      return {
        message: `${count} ${count === 1 ? 'achiever' : 'achievers'} joined`,
        icon: 'person-add-outline',
        importance: 8
      }
    case 'goalStakeholderBecameAdmin':
      break
    case 'goalSupportCreated': {
      return {
        message: `${count} ${count === 1 ? 'support' : 'supports'} added`,
        icon: 'heart-outline',
        importance: 9
      }
    }
    case 'goalChatMessageCreated': {
      return {
        message: `${count} new ${count === 1 ? 'message' : 'messages'}`,
        icon: 'chatbox-outline',
        importance: 10
      }
    }
    default:
      return undefined
  }
  return undefined
}
