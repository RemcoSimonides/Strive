import { GoalEvent } from '@strive/goal/goal/+state/goal.firestore';
import { enumEvent, Notification, NotificationMessageText, NotificationSource } from '../+state/notification.firestore';

const notificationIcons = [
  'alert-outline',
  'bookmark-outline',
  'chatbox-outline',
  'checkmark-outline',
  'create-outline',
  'flag-outline',
  'heart-outline',
  'heart-dislike-outline',
  'person-add-outline',
  'person-remove-outline',
  'close-outline'
] as const
export type NotificationIcons = typeof notificationIcons[number];

function throwError(event: enumEvent, target: string) {
  throw new Error(`No notification message for event ${event} and target ${target}`)
}

function get(type: 'user' | 'goal', source:  NotificationSource): { title: string, image: string, link: string } {
  const data = {
    user: {
      title: source.user?.username,
      image: source.user?.photoURL,
      link: `/profile/${source.user?.uid}`
    },
    goal: {
      title: source.goal?.title,
      image: source.goal?.image,
      link: `/goal/${source.goal?.id}`
    }
  }
  return data[type]
}

export interface GoalNotificationMessage {
  icon: NotificationIcons
  message: NotificationMessageText[]
}

export interface NotificationMessage {
  title: string
  image: string
  link: string
  message: NotificationMessageText[]
}

export function getGoalNotificationMessage({ name, source }: GoalEvent): GoalNotificationMessage {
  switch (name) {
    case enumEvent.gNewBucketlist:
    case enumEvent.gNewActive:
    case enumEvent.gNewFinished:
      return {
        icon: 'flag-outline',
        message: [{ text: `Goal created` }]
      }
    case enumEvent.gFinished:
      return {
        icon: 'flag-outline',
        message: [{ text: `Goal is finished!` }]
      }
    case enumEvent.gMilestoneCompletedSuccessfully:
      return {
        icon: 'checkmark-outline',
        message: [
          { text: `Milestone "${source.milestone.content}" successfully completed` }
        ]
      }
    case enumEvent.gMilestoneCompletedUnsuccessfully:
      return {
        icon: 'checkmark-outline',
        message: [
          { text: `Milestone "${source.milestone.content}" failed to complete` }
        ]
      }
    case enumEvent.gMilestoneDeadlinePassed:
      return {
        icon: 'alert-outline',
        message: [
          { text: `Milestone "${source.milestone.content}" passed its due date` }
        ]
      }
    case enumEvent.gStakeholderAchieverAdded:
      return {
        icon: 'person-add-outline',
        message: [
          { text: source.user.username, link: `/profile/${source.user.uid}` },
          { text: ` joined as an Achiever`}
        ]
      }
    case enumEvent.gStakeholderAdminAdded:
      return {
        icon: 'person-add-outline',
        message: [
          { text: source.user.username, link: `/profile/${source.user.uid}` },
          { text: ` became an Admin` }
        ]
      }
    case enumEvent.gRoadmapUpdated:
      return {
        icon: 'create-outline',
        message: [
          {
            text: `Roadmap has been updated`
          }
        ]
      }
    case enumEvent.gNewPost:
      return {
        icon: 'bookmark-outline',
        message: [] // no message - just the post
      }
    case enumEvent.gSupportAdded: {
      const isMilestone = source.milestone?.id
      const suffix = isMilestone ? ` to milestone "${source.milestone.content}" ` : ''
      return {
        icon: 'heart-outline',
        message: [
          { text: source.user.username, link: `/profile/${source.user.uid}` },
          { text: ` added support "${source.support.description}"${suffix}`}
        ]
      }
    }
    default:
      return {
        icon: 'alert-outline',
        message: [] 
      }
  }
}

export function getNotificationMessage({ event, source }: Notification): NotificationMessage {
  switch (event) {
    case enumEvent.gNewBucketlist:
      return {
        ...get('user', source),
        message: [
          { text: `${source.user.username} added "` },
          { text: source.goal.title, link: `goal/${source.goal.id}` },
          { text: `" to bucket list` }
        ]
      }
    case enumEvent.gNewActive:
      return {
        ...get('user', source),
        message: [
          { text: `${source.user.username} started goal "` },
          { text: source.goal.title, link: `goal/${source.goal.id}` },
          { text: `"` }
        ]
      }
    case enumEvent.gNewFinished:
      return {
        ...get('user', source),
        message: [
          { text: `${source.user.username} journaled about "` },
          { text: source.goal.title, link: `goal/${source.goal.id}` },
          { text: `"` }
        ]
      }

    case enumEvent.gFinished:
      return {
        ...get('user', source),
        message: [
          { text: `${source.user.username} finished goal "` },
          {
            text: source.goal.title,
            link: `goal/${source.goal.id}`
          },
          { text: `"` }
        ]
      }

    case enumEvent.gMilestoneDeadlinePassed:
      return {
        ...get('goal', source),
        message: [
          { text: `Milestone "${source.milestone.content}" of goal "${source.goal.title}" passed its due date` }
        ]
      }

    case enumEvent.gStakeholderRequestToJoinPending:
      return {
        ...get('goal', source),
        message: [
          {
            text: source.user.username,
            link: `profile/${source.user.uid}`
          },
          { text: ` requests to join goal` }
        ]
      }

    case enumEvent.gStakeholderRequestToJoinAccepted: 
      return {
        ...get('goal', source),
        message: [
          { text: `Your request to join goal "${source.goal.title}" has been accepted` }
        ]
      }

    case enumEvent.gStakeholderRequestToJoinRejected:
      return {
        ...get('goal', source),
        message: [
          { text: `Your request to join "${source.goal.title}" has been rejected` }
        ]
      }

    case enumEvent.userSpectatorAdded:
      return {
        ...get('user', source),
        message: [
          { text: `${source.user.username} started following you` }
        ]
      }
    
    case enumEvent.gSupportPendingFailed:
    case enumEvent.gSupportPendingSuccesful: {
      const isMilestone = source.milestone?.id
      const prefix = isMilestone ? `Milestone "${source.milestone.content}"` : `Goal`
      return {
        ...get('goal', source),
        link: '/supports',
        message: [
          { text: `${prefix} has been completed. Decide to give "${source.support.description}" or not` }
        ]
      }
    }

    case enumEvent.gSupportPaid:
      return {
        ...get('goal', source),
        link: '/supports',
        message: [
          {
            text: source.user.username,
            link: `profile/${source.user.uid}`
          },
          {
            text: ` paid support "${source.support.description}"`
          }
        ]
      }
    
    case enumEvent.gSupportRejected: {
      const isMilestone = !!source.milestone?.id
      const suffix = isMilestone ? ` for milestone "${source.milestone.content}"` : ''

      return {
        ...get('goal', source),
        link: '/supports',
        message: [
          {
            text: source.user.username,
            link: `profile/${source.user.uid}`
          },
          { text: ` rejected paying support "${source.support.description}"${suffix}`}
        ]
      }
    }

    case enumEvent.gSupportDeleted: {
      const isMilestone = !!source.milestone?.id

      return {
        ...get('goal', source),
        message: []
      }
    }
  }
}