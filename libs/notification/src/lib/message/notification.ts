import { Goal, Notification, User } from '@strive/model'
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

const empty: NotificationMessage = { image: '', link: '', message: '', title: '', type: 'goal' }
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
  message: string
}

export function getNotificationMessage(notification: Notification): NotificationMessage {
  const { event, goal, user, milestone, support } = notification

  switch (event) {
    case 'goalCreated':
      if (!user || !goal) return throwError(notification)

      return {
        ...getUser(user),
        link: `/goal/${goal.id}`,
        message: `${user.username} created goal "${goal.title}"`
      }

    case 'goalDeadlinePassed':
      if (!goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: `Goal "${goal.title}" passed its end date`
      }

    case 'goalCreatedFinished':
      if (!user || !goal) return throwError(notification)

      return {
        ...getUser(user),
        message: `${user.username} journaled about "${goal.title}"`
      }

    case 'goalDeleted':
      if (!goal) return throwError(notification)

      return {
        ...getGoal(goal),
        link: `/supports`,
        message: `${goal.title} has been deleted and therefore your supports are cancelled`
      }

    case 'goalFinishedSuccessfully': {
      if (!user || !goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: `${user.username} finished goal "${goal.title}"`
      }
    }

    case 'goalFinishedUnsuccessfully': {
      if (!user || !goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: `${user.username} finished goal "${goal.title}" unsuccesfully`
      }
    }

    case 'goalMilestoneDeadlinePassed':
      if (!milestone || !goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: `Milestone "${milestone.content}" of goal "${goal.title}" passed its due date`
      }

    case 'goalStakeholderInvitedToJoin':
      if (!user || !goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: `${user.username} invited you to join goal "${goal.title}"`
      }

    case 'goalStakeholderRequestedToJoin':
      if (!user || !goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: `${user.username} requests to join goal`
      }

    case 'goalStakeholderRequestToJoinAccepted':
      if (!goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: `Your request to join goal "${goal.title}" has been accepted`
      }

    case 'goalStakeholderRequestToJoinRejected':
      if (!goal) return throwError(notification)

      return {
        ...getGoal(goal),
        message: `Your request to join "${goal.title}" has been rejected`
      }

    case 'userSpectatorCreated':
      if (!user) return throwError(notification)

      return {
        ...getUser(user),
        message: `${user.username} started following you`
      }

    case 'goalSupportCreated': {
      if (!user || !goal || !support) return throwError(notification)

      const message = milestone?.id
        ? `${user.username} supports milestone "${milestone.content}" of goal "${goal.title}" with "${support.description}"`
        : `${user.username} supports goal "${goal.title}" with "${support.description}"`

      return {
        ...getUser(user),
        link: `/supports/${support.id}`,
        params: { goalId: support.goalId },
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
        link: `/supports/${support.id}`,
        params: { goalId: support.goalId },
        message: `${prefix} has been completed. Decide to give "${support.description}" or not`
      }
    }

    case 'goalSupportStatusPaid':
      if (!goal || !support || !user) return throwError(notification)
      
      return {
        ...getGoal(goal),
        link: `/supports/${support.id}`,
        params: { goalId: support.goalId },
        message: `${user.username} paid support "${support.description}"`
      }
    
    case 'goalSupportStatusRejected': {
      if (!goal || !user || !support) return throwError(notification)

      const isMilestone = !!milestone?.id
      const suffix = isMilestone ? ` for milestone "${milestone.content}"` : ''

      return {
        ...getGoal(goal),
        link: `/supports/${support.id}`,
        params: { goalId: support.goalId },
        message: `${user.username} rejected paying support "${support.description}"${suffix}`
      }
    }

    default:
      return empty
  }
}