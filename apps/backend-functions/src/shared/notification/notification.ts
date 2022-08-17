import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
// Interfaces
import { createNotification, Notification, createNotificationSource, GoalEvent, createGoalStakeholder, createPersonal } from '@strive/model'
import { getPushMessage, PushMessage, PushNotificationTarget } from '@strive/notification/message/push-notification';
import { toDate, unique } from '../utils';

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

export interface SendOptions {
  send: {
    notification?: boolean
    pushNotification?: boolean,
    toSpectator?: {
      notification?: boolean
      pushNotification?: boolean
    }
  },
  roles: {
    isAdmin?: boolean
    isAchiever?: boolean
    isSupporter?: boolean
  }
}

export async function sendNotificationToUsers(notification: Notification, to: string | string[], pushNotification?: PushNotificationTarget) {
  const receivers = Array.isArray(to) ? to : [to]
  
  notification.updatedAt = serverTimestamp() as any
  notification.createdAt = serverTimestamp() as any

  logger.log('Sending notification: ', notification)
  logger.log('To: ', receivers)

  const promises = receivers.map(receiver => db.collection(`Users/${receiver}/Notifications`).add(notification))
  await Promise.all(promises)

  if (pushNotification) {
    const message = getPushMessage(notification, pushNotification)
    if (message) sendPushNotificationToUsers(message, receivers)
  }
}

export async function sendGoalEventNotification(
  event: GoalEvent,
  options: SendOptions,
  excludeTriggerer: boolean
) {
  const goalId = event.source.goal.id
  const except =  excludeTriggerer ? event.source.user?.uid : ''
  
  const notification = createNotification({
    event: event.name,
    source: createNotificationSource(event.source)
  })

  const { send, roles } = options
  const stakeholders = await getGoalStakeholders(goalId, roles)
  const stakeholdersExceptTriggerer = stakeholders.filter(uid => uid !== except)
  
  if (send.notification) {
    const receivers = excludeTriggerer ? stakeholdersExceptTriggerer : stakeholders
    sendNotificationToUsers(notification, receivers)
  }

  if (send.pushNotification) {
    const message = getPushMessage(notification, 'stakeholder')
    const receivers = excludeTriggerer ? stakeholdersExceptTriggerer : stakeholders
    if (message) sendPushNotificationToUsers(message, receivers)
  }

  if (send.toSpectator) {
    const promises = stakeholders.map(uid => db.collection(`Users/${uid}/Spectators`).where('isSpectator', '==', true).get())
    const snaps = await Promise.all(promises)
    const ids: string[][] = snaps.map(snap => snap.docs.map(doc => doc.id))
    const flatten = ids.reduce((acc, val) => acc.concat(val), [])
    const spectators = unique<string>(flatten)
    logger.log('spectators: ', spectators)

    if (send.toSpectator.notification) {
      sendNotificationToUsers(notification, spectators)
    }

    if (send.toSpectator.pushNotification) {
      const message = getPushMessage(notification, 'spectator')
      if (message) sendPushNotificationToUsers(message, spectators)
    }
  }
}

export async function sendPushNotificationToUsers(message: PushMessage, receiver: string | string[]) {
  const receivers = Array.isArray(receiver) ? receiver : [receiver]
  if (!receivers.length) return
  const refs = receivers.map(uid => db.doc(`Users/${uid}/Personal/${uid}`))
  const snaps = await db.getAll(...refs)

  for (const snap of snaps) {
    const personal = createPersonal(toDate({ ...snap.data(), id: snap.id }))
    logger.log(`going to send push notification to ${personal?.email}`)

    if (personal.fcmTokens.some(token => token)) {
      // TODO
      // Try to define a tag for each too so they get aggregated
      // Do so by getting the unread notifications.
      // Add clickaction to set notification to being read
      // GOOD LUCK!

      logger.log('sending notification to devices', personal.fcmTokens)

      admin.messaging().sendToDevice(personal.fcmTokens, {
        notification: {
          ...message,
          clickAction: message.url
        }
      }).catch((err => {
        logger.error('error sending push notification', typeof err === 'object' ? JSON.stringify(err) : err)
      }))
    }
  }
}

async function getGoalStakeholders(
  goalId: string,
  roles: {
    isAdmin?: boolean,
    isAchiever?: boolean,
    isSupporter?: boolean
  }
): Promise<string[]> {

  const stakeholderColSnap = await db.collection(`Goals/${goalId}/GStakeholders`).get() 
  const receivers: string[] = []

  for (const snap of stakeholderColSnap.docs) {
    const stakeholder = createGoalStakeholder(snap.data())
    if (roles.isAdmin === stakeholder.isAdmin || roles.isAchiever === stakeholder.isAchiever || roles.isSupporter === stakeholder.isSupporter) {
      receivers.push(snap.id)
    }
  }

  return receivers
}
