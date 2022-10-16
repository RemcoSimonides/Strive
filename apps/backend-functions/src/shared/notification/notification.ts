import * as admin from 'firebase-admin'
import { logger } from 'firebase-functions'
// Interfaces
import { createNotificationBase, NotificationBase, GoalEvent, createGoalStakeholder, createPersonal, Goal, Milestone, Support, User, Notification } from '@strive/model'
import { getPushMessage, PushMessage, PushNotificationTarget } from '@strive/notification/message/push-notification'
import { getDocument, toDate, unique } from '../utils'

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

export async function sendNotificationToUsers(notificationBase: NotificationBase, to: string | string[], pushNotification?: PushNotificationTarget) {
  const recipients = Array.isArray(to) ? to : [to]
  
  notificationBase.updatedAt = serverTimestamp() as any
  notificationBase.createdAt = serverTimestamp() as any

  logger.log('Sending notification: ', notificationBase)
  logger.log('To: ', recipients)

  const promises = recipients.map(recipient => db.collection(`Users/${recipient}/Notifications`).add(notificationBase))
  await Promise.all(promises)

  if (pushNotification) {
    const { goalId, milestoneId, supportId, userId } = notificationBase
    const goal = goalId ? await getDocument<Goal>(`Goals/${goalId}`) : undefined
    const milestone = milestoneId ? await getDocument<Milestone>(`Goals/${goalId}/Milestones/${milestoneId}`) : undefined
    const support = supportId ? await getDocument<Support>(`Goals/${goalId}/Supports/${supportId}`) : undefined
    const user = userId ? await getDocument<User>(`Users/${userId}`) : undefined
  
    const notification: Notification = notificationBase
    if (goal) notification.goal = goal
    if (milestone) notification.milestone = milestone
    if (support) notification.support = support
    if (user) notification.user = user

    const message = getPushMessage(notification, pushNotification)
    if (message) sendPushNotificationToUsers(message, recipients)
  }
}

export async function sendGoalEventNotification(
  event: GoalEvent,
  options: SendOptions,
  excludeTriggerer: boolean
) {
  const { goalId, userId, milestoneId, supportId } = event
  const except =  excludeTriggerer ? userId : ''
  
  const notificationBase = createNotificationBase({ ...event, event: event.name })
  const notification: Notification = createNotificationBase(notificationBase)

  const { send, roles } = options
  const stakeholders = await getGoalStakeholders(goalId, roles)
  const stakeholdersExceptTriggerer = stakeholders.filter(uid => uid !== except)

  if (send.pushNotification || send.toSpectator?.pushNotification) {
    const goalPromise = getDocument<Goal>(`Goals/${goalId}`).then(goal => notification.goal = goal)
    const milestonePromise = milestoneId ? getDocument<Milestone>(`Goals/${goalId}/Milestones/${milestoneId}`).then(milestone => notification.milestone = milestone) : undefined
    const supportPromise = supportId ? getDocument<Support>(`Goals/${goalId}/Supports/${supportId}`).then(support => notification.support = support) : undefined
    const userPromise = userId ? getDocument<User>(`Users/${userId}`).then(user => notification.user = user) : undefined
    await Promise.all([goalPromise, milestonePromise, supportPromise, userPromise])
  }

  
  if (send.notification) {
    const recipients = excludeTriggerer ? stakeholdersExceptTriggerer : stakeholders
    sendNotificationToUsers(notificationBase, recipients)
  }

  if (send.pushNotification) {
    const message = getPushMessage(notification, 'stakeholder')
    const recipients = excludeTriggerer ? stakeholdersExceptTriggerer : stakeholders
    if (message) sendPushNotificationToUsers(message, recipients)
  }

  if (send.toSpectator) {
    const promises = stakeholders.map(uid => db.collection(`Users/${uid}/Spectators`).where('isSpectator', '==', true).get())
    const snaps = await Promise.all(promises)
    const ids: string[][] = snaps.map(snap => snap.docs.map(doc => doc.id))
    const flatten = ids.reduce((acc, val) => acc.concat(val), [])
    const distinct = unique<string>(flatten)
    const spectators = distinct.filter(id => !stakeholders.some(uid => uid === id))

    if (send.toSpectator.notification) {
      sendNotificationToUsers(notificationBase, spectators)
    }

    if (send.toSpectator.pushNotification) {
      const message = getPushMessage(notification, 'spectator')
      if (message) sendPushNotificationToUsers(message, spectators)
    }
  }
}

export async function sendPushNotificationToUsers(message: PushMessage, recipient: string | string[]) {
  const recipients = Array.isArray(recipient) ? recipient : [recipient]
  if (!recipients.length) return
  const refs = recipients.map(uid => db.doc(`Users/${uid}/Personal/${uid}`))
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
  const recipients: string[] = []

  for (const snap of stakeholderColSnap.docs) {
    const stakeholder = createGoalStakeholder(snap.data())
    if (roles.isAdmin === stakeholder.isAdmin || roles.isAchiever === stakeholder.isAchiever || roles.isSupporter === stakeholder.isSupporter) {
      recipients.push(snap.id)
    }
  }

  return recipients
}
