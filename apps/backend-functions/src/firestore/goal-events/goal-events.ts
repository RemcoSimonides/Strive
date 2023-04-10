import { Goal, GoalEvent, createNotificationBase, SupportBase } from '@strive/model'
import { onDocumentCreate, logger } from '@strive/api/firebase'
import { sendGoalEventNotification, sendNotificationToUsers, SendOptions } from '../../shared/notification/notification'
import { getDocument, toDate } from '../../shared/utils'

export const goalEventCreatedHandler = onDocumentCreate(`GoalEvents/{eventId}`, 'goalEventCreatedHandler',
async snapshot => {

  const event = toDate<GoalEvent>({ ...snapshot.data(), id: snapshot.id })
  const notification = createNotificationBase({ ...event, event: event.name })
  const { goalId, userId, supportId } = event

  logger.log('event incoming: ', event)

  switch (event.name) {
    case 'goalCreated':
    case 'goalCreatedFinished': {
      const goal = await getDocument<Goal>(`Goals/${goalId}`)
      if (goal.publicity === 'public') {

        const options: SendOptions = {
          send: {
            toSpectator: {
              notification: true,
              pushNotification: true
            }
          },
          roles: {
            isAdmin: true,
            isAchiever: true
          }
        }
        return sendGoalEventNotification(event, options, false)
      }
      break
    }

    case 'goalDeadlinePassed': {
      const options: SendOptions = {
        send: {
          notification: true,
          pushNotification: true
        },
        roles: {
          isAchiever: true
        }
      }
      return sendGoalEventNotification(event, options, false)
    }

    case 'goalDeleted': {
      const options: SendOptions = {
        send: {
          notification: true
        },
        roles: {
          isSupporter: true
        }
      }
      return sendGoalEventNotification(event, options, true)
    }

    case 'goalFinishedSuccessfully': {
      const goal = await getDocument<Goal>(`Goals/${goalId}`)
      const options: SendOptions = {
        send: {
          notification: true,
          pushNotification: true,
          toSpectator: {
            pushNotification: goal.publicity === 'public'
          }
        },
        roles: {
          isAdmin: true,
          isAchiever: true,
          isSupporter: true
        }
      }
      return sendGoalEventNotification(event, options, true)
    }

    case 'goalFinishedUnsuccessfully': {
      const options: SendOptions = {
        send: {
          notification: true,
          pushNotification: true
        },
        roles: {
          isAdmin: true,
          isAchiever: true,
          isSupporter: true
        }
      }
      return sendGoalEventNotification(event, options, true)
    }

    case 'goalStoryPostCreated': {
      const options: SendOptions = {
        send: {
          pushNotification: true
        },
        roles: {
          isAdmin: true,
          isAchiever: true,
          isSupporter: true
        }
      }
      return sendGoalEventNotification(event, options, true)
    }

    case 'goalMilestoneCreated':
      break

    case 'goalMilestoneDeadlinePassed': {
      const options: SendOptions = {
        send: {
          notification: true,
          pushNotification: true
        },
        roles: {
          isAchiever: true
        }
      }
      return sendGoalEventNotification(event, options, false)
    }

    case 'goalMilestoneCompletedSuccessfully':
    case 'goalMilestoneCompletedUnsuccessfully': {
      break
    }

    case 'goalStakeholderBecameAdmin':
      break
    case 'goalStakeholderBecameAchiever':
      // TODO optional send push notification to spectators of new stakeholder
      // TOD send (push) notification to achievers of goal (except the person who accepted the request and the new stakeholder)
      break

    case 'goalStakeholderInvitedToJoin': {
      return sendNotificationToUsers(notification, userId, 'user')
    }

    case 'goalStakeholderRequestedToJoin': {
      const options: SendOptions = {
        send: {
          pushNotification: true
        },
        roles: {
          isAdmin: true
        }
      }
      return sendGoalEventNotification(event, options, true)
    }

    case 'goalStakeholderRequestToJoinAccepted':
    case 'goalStakeholderRequestToJoinRejected': {
      return sendNotificationToUsers(notification, userId, 'user')
    }

    case 'goalChatMessageCreated': {
      const options: SendOptions = {
        send: {
          pushNotification: true
        },
        roles: {
          isAdmin: true,
          isSupporter: true,
          isAchiever: true
        }
      }
      return sendGoalEventNotification(event, options, true)
    }

    case 'goalSupportCreated': {
      const support = await getDocument<SupportBase>(`Goals/${goalId}/Supports/${supportId}`)
      const { recipientId, supporterId } = support
      if (recipientId === supporterId) return

      return sendNotificationToUsers(notification, recipientId, 'user')
    }

    default:
      logger.warn('no case for this event: ', event.name)
      break
  }
})
