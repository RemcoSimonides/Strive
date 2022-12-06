import { Goal, Notification, NotificationMessageText, User } from '@strive/model'
import { captureException } from '@sentry/angular'

type NotificationSourceType = 'goal' | 'profile'

function getUser(user: User): { title: string, image: string, type: NotificationSourceType, link: string } {
  return {
    title: user.username ?? '',
    image: user.photoURL ?? '',
    type: 'profile',
    link: `/profile/${user.uid}`
  }
}

function getGoal(goal: Goal): { title: string, image: string, type: NotificationSourceType, link: string } {
  return {
    title: goal?.title ?? '',
    image: goal?.image ?? '',
    type: 'goal',
    link: `/goal/${goal?.id}`
  }
}

const empty: NotificationMessage = { image: '', link: '', message: [], title: '', type: 'goal' }
function throwError(notification: Notification) {
  captureException(`Notification doesn't contain needed information`, notification)
  return empty
}
export interface NotificationMessage {
  title: string
  image: string
  type: NotificationSourceType
  link: string
  params?: unknown
  message: NotificationMessageText[]
}

export function getNotificationMessage(notification: Notification): NotificationMessage {
  const { event, goal, user, milestone, support } = notification

  switch (event) {
    case 'goalCreated':
      if (!user || !goal) return throwError(notification)

      return {
        ...getUser(user),
        link: `/goal/${goal.id}`,
        message: [
          { text: `${user.username} created goal "` },
          { text: goal.title, link: `goal/${goal.id}` },
          { text: `"` }
        ]
      }
    case 'goalCreatedFinished':
      if (!user || !goal) return throwError(notification)

      return {
        ...getUser(user),
        message: [
          { text: `${user.username} journaled about "` },
          { text: goal.title, link: `goal/${goal.id}` },
          { text: `"` }
        ]
      }

    case 'goalDeleted':
      if (!goal) return throwError(notification)

      return {
        ...getGoal(goal),
        link: `/supports`,
        message: [
          { text: `${goal.title} has been deleted and therefore your supports are cancelled` }
        ]
      }

    case 'goalIsFinished':
      if (!user || !goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: [
          { text: `${user.username} finished goal "` },
          {
            text: goal.title,
            link: `goal/${goal.id}`
          },
          { text: `"` }
        ]
      }

    case 'goalMilestoneDeadlinePassed':
      if (!milestone || !goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: [
          { text: `Milestone "${milestone.content}" of goal "${goal.title}" passed its due date` }
        ]
      }

    case 'goalStakeholderRequestedToJoin':
      if (!user || !goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: [
          {
            text: user.username,
            link: `profile/${user.uid}`
          },
          { text: ` requests to join goal` }
        ]
      }

    case 'goalStakeholderRequestToJoinAccepted':
      if (!goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: [
          { text: `Your request to join goal "${goal.title}" has been accepted` }
        ]
      }

    case 'goalStakeholderRequestToJoinRejected':
      if (!goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: [
          { text: `Your request to join "${goal.title}" has been rejected` }
        ]
      }

    case 'userSpectatorCreated':
      if (!user) return throwError(notification)

      return {
        ...getUser(user),
        message: [
          { text: `${user.username} started following you` }
        ]
      }

    case 'goalSupportCreated': {
      if (!user || !goal || !support) return throwError(notification)

      const suffix = `with "${support.description}"`
      const message: NotificationMessageText[] = []
      if (milestone?.id) {
        message.push({ text: `${user.username} supports milestone "${milestone.content}" of goal "` })
        message.push({ text: goal.title, link: `/goal/${goal.id}` })
        message.push({ text: `" ${suffix}`})
      } else {
        message.push({ text: `${user.username} supports goal "` })
        message.push({ text: goal.title, link: `/goal/${goal.id}` })
        message.push({ text: `" ${suffix}`})
      }

      return {
        ...getUser(user),
        link: '/supports',
        params: { t: 'forYou' },
        message
      }
    }
    
    case 'goalSupportStatusPendingUnsuccessful':
    case 'goalSupportStatusPendingSuccessful': {
      if (!goal || !support) return throwError(notification)

      const isMilestone = milestone?.id
      const prefix = isMilestone ? `Milestone "${milestone.content}"` : `Goal`
      return {
        ...getGoal(goal),
        link: '/supports',
        message: [
          { text: `${prefix} has been completed. Decide to give "${support.description}" or not` }
        ]
      }
    }

    case 'goalSupportStatusPaid':
      if (!goal || !support || !user) return throwError(notification)
      
      return {
        ...getGoal(goal),
        link: '/supports',
        params: { t: 'forYou' },
        message: [
          {
            text: user.username,
            link: `profile/${user.uid}`
          },
          {
            text: ` paid support "${support.description}"`
          }
        ]
      }
    
    case 'goalSupportStatusRejected': {
      if (!goal || !user || !support) return throwError(notification)

      const isMilestone = !!milestone?.id
      const suffix = isMilestone ? ` for milestone "${milestone.content}"` : ''

      return {
        ...getGoal(goal),
        link: '/supports',
        message: [
          {
            text: user.username,
            link: `profile/${user.uid}`
          },
          { text: ` rejected paying support "${support.description}"${suffix}`}
        ]
      }
    }

    default:
      return empty
  }
}