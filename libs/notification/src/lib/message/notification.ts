import { Notification, NotificationMessageText, NotificationSource } from '@strive/model'

function get(type: 'user' | 'goal', source:  NotificationSource): { title: string, image: string, link: string } {
  const data = {
    user: {
      title: source.user?.username ?? '',
      image: source.user?.photoURL ?? '',
      link: `/profile/${source.user?.uid}`
    },
    goal: {
      title: source.goal?.title ?? '',
      image: source.goal?.image ?? '',
      link: `/goal/${source.goal?.id}`
    }
  }
  return data[type]
}

export interface NotificationMessage {
  title: string
  image: string
  link: string
  message: NotificationMessageText[]
}

export function getNotificationMessage({ event, source }: Notification): NotificationMessage {
  switch (event) {
    case 'goalCreatedStatusBucketlist':
      return {
        ...get('user', source),
        message: [
          { text: `${source.user!.username} added "` },
          { text: source.goal!.title, link: `goal/${source.goal!.id}` },
          { text: `" to bucket list` }
        ]
      }
    case 'goalCreatedStatusActive':
      return {
        ...get('user', source),
        link: `/goal/${source.goal?.id}`,
        message: [
          { text: `${source.user!.username} started goal "` },
          { text: source.goal!.title, link: `goal/${source.goal!.id}` },
          { text: `"` }
        ]
      }
    case 'goalCreatedStatusFinished':
      return {
        ...get('user', source),
        message: [
          { text: `${source.user!.username} journaled about "` },
          { text: source.goal!.title, link: `goal/${source.goal!.id}` },
          { text: `"` }
        ]
      }

    case 'goalDeleted':
      return {
        ...get('goal', source),
        link: `/supports`,
        message: [
          { text: `${source.goal!.title} has been deleted and therefore your supports are cancelled` }
        ]
      }

    case 'goalStatusFinished':
      return {
        ...get('user', source),
        message: [
          { text: `${source.user!.username} finished goal "` },
          {
            text: source.goal!.title,
            link: `goal/${source.goal!.id}`
          },
          { text: `"` }
        ]
      }

    case 'goalMilestoneDeadlinePassed':
      return {
        ...get('goal', source),
        message: [
          { text: `Milestone "${source.milestone!.content}" of goal "${source.goal!.title}" passed its due date` }
        ]
      }

    case 'goalStakeholderRequestedToJoin':
      return {
        ...get('goal', source),
        message: [
          {
            text: source.user!.username,
            link: `profile/${source.user!.uid}`
          },
          { text: ` requests to join goal` }
        ]
      }

    case 'goalStakeholderRequestToJoinAccepted': 
      return {
        ...get('goal', source),
        message: [
          { text: `Your request to join goal "${source.goal!.title}" has been accepted` }
        ]
      }

    case 'goalStakeholderRequestToJoinRejected':
      return {
        ...get('goal', source),
        message: [
          { text: `Your request to join "${source.goal!.title}" has been rejected` }
        ]
      }

    case 'userSpectatorCreated':
      return {
        ...get('user', source),
        message: [
          { text: `${source.user!.username} started following you` }
        ]
      }
    
    case 'goalSupportStatusPendingUnsuccessful':
    case 'goalSupportStatusPendingSuccessful': {
      const isMilestone = source.milestone?.id
      const prefix = isMilestone ? `Milestone "${source.milestone!.content}"` : `Goal`
      return {
        ...get('goal', source),
        link: '/supports',
        message: [
          { text: `${prefix} has been completed. Decide to give "${source.support!.description}" or not` }
        ]
      }
    }

    case 'goalSupportStatusPaid':
      return {
        ...get('goal', source),
        link: '/supports',
        message: [
          {
            text: source.user!.username,
            link: `profile/${source.user!.uid}`
          },
          {
            text: ` paid support "${source.support!.description}"`
          }
        ]
      }
    
    case 'goalSupportStatusRejected': {
      const isMilestone = !!source.milestone?.id
      const suffix = isMilestone ? ` for milestone "${source.milestone!.content}"` : ''

      return {
        ...get('goal', source),
        link: '/supports',
        message: [
          {
            text: source.user!.username,
            link: `profile/${source.user!.uid}`
          },
          { text: ` rejected paying support "${source.support!.description}"${suffix}`}
        ]
      }
    }

    default:
      return {
        image: '',
        link: '',
        message: [],
        title: ''
      }
  }
}