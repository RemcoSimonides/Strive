import { Goal, GoalEvent, createNotificationSource, createNotification } from '@strive/model'
import { logger } from 'firebase-functions';
import { functions } from '../../internals/firebase'
import { sendGoalEventNotification, sendNotificationToUsers, SendOptions } from '../../shared/notification/notification';
import { getDocument, toDate } from '../../shared/utils';

export const goalEventCreatedHandler = functions.firestore.document(`GoalEvents/{eventId}`)
  .onCreate(async snapshot => {

    const event = toDate<GoalEvent>({ ...snapshot.data(), id: snapshot.id })
    const notification = createNotification({
      event: event.name,
      source: createNotificationSource(event.source)
    })
    const goalId = event.source.goal.id
    const userId = event.source.user.uid

    logger.log('event incoming: ', event)

    switch (event.name) {
      case 'goalCreatedStatusBucketlist':
      case 'goalCreatedStatusActive':
      case 'goalCreatedStatusFinished': {
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

      case 'goalStatusFinished': {
        const options: SendOptions = {
          send: {
            notification: true,
            pushNotification: true,
            toSpectator: {
              pushNotification: true
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
        const options: SendOptions = {
          send: {
            pushNotification: true
          },
          roles: {
            isAdmin: true,
            isAchiever: true
          }
        }
        return sendGoalEventNotification(event, options, true)
      }

      default:
        logger.warn('no case for this event: ', event.name)
        break
    }
  })
