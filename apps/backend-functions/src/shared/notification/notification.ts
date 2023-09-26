import { admin, logger, db, serverTimestamp } from '@strive/api/firebase'
import type { Message } from 'firebase-admin/messaging'
// Interfaces
import { createNotificationBase, NotificationBase, GoalEvent, createGoalStakeholder, createPersonal, Goal, Milestone, Support, User, Notification, SupportBase, GoalStakeholder, Roles, PushNotificationSettingKey } from '@strive/model'
import { getPushMessage, PushMessage, PushNotificationSetting, PushNotificationTarget } from '@strive/notification/message/push-notification'
import { getDocument, toDate, unique } from '../utils'

export interface SendOptions {
  toStakeholder?: {
    notification?: boolean
    pushNotification?: boolean
    role: keyof Roles
  }
  toSpectator?: {
    notification?: keyof Pick<Roles, 'isAchiever'>
    pushNotification?: Extract<PushNotificationSettingKey, 'userSpectatingGeneral'>
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
    const support = supportId ? await getDocument<SupportBase>(`Goals/${goalId}/Supports/${supportId}`) : undefined
    const user = userId ? await getDocument<User>(`Users/${userId}`) : undefined

    const notification: Notification = notificationBase
    if (goal) notification.goal = goal
    if (milestone) notification.milestone = milestone
    if (support) notification.support = support
    if (user) notification.user = user

    const message = getPushMessage(notification, 'user')
    if (message) sendPushNotificationToUsers(message, recipients)
  }
}

export async function sendGoalEventNotification(
  event: GoalEvent,
  options: SendOptions,
  excludeTriggerer: boolean
) {
  const { goalId, userId, milestoneId, supportId } = event

  const notificationBase = createNotificationBase({ ...event, event: event.name })
  const notification: Notification = createNotificationBase(notificationBase)

  const roles: Partial<Roles> = {}
  if (options.toStakeholder) roles[options.toStakeholder?.role] = true
  if (options.toSpectator?.notification) roles[options.toSpectator.notification] = true

  const all = await getGoalStakeholders(goalId, roles)

  const unmuted = all.filter(stakeholder => {
    if (event.name === 'goalChatMessageCreated') {
      return stakeholder.settings.goalChat
    }
    return true
  })

  const except =  excludeTriggerer ? userId : ''
  const stakeholders = except ? unmuted.filter(stakeholder => stakeholder.uid !== except) : unmuted

  if (options.toStakeholder?.pushNotification || options.toSpectator?.pushNotification) {
    const goalPromise = getDocument<Goal>(`Goals/${goalId}`).then(goal => notification.goal = goal)
    const milestonePromise = milestoneId ? getDocument<Milestone>(`Goals/${goalId}/Milestones/${milestoneId}`).then(milestone => notification.milestone = milestone) : undefined
    const supportPromise = supportId ? getDocument<Support>(`Goals/${goalId}/Supports/${supportId}`).then(support => notification.support = support) : undefined
    const userPromise = userId ? getDocument<User>(`Users/${userId}`).then(user => notification.user = user) : undefined
    await Promise.all([goalPromise, milestonePromise, supportPromise, userPromise])
  }

  if (options.toStakeholder?.notification) {
    const recipients = stakeholders.filter(stakeholder => stakeholder[options.toStakeholder.role] === true)
    const recipientIds = recipients.map(stakeholder => stakeholder.uid)
    sendNotificationToUsers(notificationBase, recipientIds)
  }

  if (options.toStakeholder?.pushNotification) {
    const message = getPushMessage(notification, 'stakeholder')
    const recipients = stakeholders.filter(stakeholder => stakeholder[options.toStakeholder.role] === true)
    const recipientIds = recipients.map(stakeholder => stakeholder.uid)
    if (message) sendPushNotificationToUsers(message, recipientIds)
  }

  if (options.toSpectator) {
    const achievers = stakeholders.filter(stakeholder => stakeholder.isAchiever) // spectators are only interested in achievers (not admins or supporters)
    const promises = achievers.map(uid => db.collection(`Users/${uid}/Spectators`).where('isSpectator', '==', true).get())
    const snaps = await Promise.all(promises)
    const ids: string[][] = snaps.map(snap => snap.docs.map(doc => doc.id))
    const flatten = ids.reduce((acc, val) => acc.concat(val), [])
    const distinct = unique<string>(flatten)
    const spectators = distinct.filter(id => !stakeholders.some(stakeholder => stakeholder.uid === id))

    if (options.toSpectator.notification) {
      sendNotificationToUsers(notificationBase, spectators)
    }

    if (options.toSpectator.pushNotification) {
      const message = getPushMessage(notification, 'spectator')
      if (message) sendPushNotificationToUsers(message, spectators)
    }
  }
}

async function sendPushNotificationToUsers(message: PushMessage, recipient: string | string[]) {
  const recipients = Array.isArray(recipient) ? recipient : [recipient]
  if (!recipients.length) return
  const refs = recipients.map(uid => db.doc(`Users/${uid}/Personal/${uid}`))
  const snaps = await db.getAll(...refs)

  for (const snap of snaps) {
    const personal = createPersonal(toDate({ ...snap.data(), id: snap.id }))
    if (!personal.fcmTokens.length) continue

    // check settings and stop sending push notification if any setting is turned off
    const { pushNotification } = personal.settings
    const relevantSettings = PushNotificationSetting[message.setting]
    if (relevantSettings.some(key => pushNotification[key] === false)) {
      logger.log(`${personal.email} has turned off push notifications for ${message.setting}`)
      continue
    }

    // TODO
    // Try to define a tag for each too so they get aggregated
    // Do so by getting the unread notifications.
    // Add clickaction to set notification to being read
    // GOOD LUCK!

    const messages = personal.fcmTokens.map(token => createPushMessage(message, token))
    logger.log(`going to send push notifications to ${personal?.email}`, messages[0])
    if (!messages.length) continue
    admin.messaging().sendEach(messages).catch((err) => {
      logger.error('error sending push notification', typeof err === 'object' ? JSON.stringify(err) : err)
    })
  }
}

async function getGoalStakeholders(
  goalId: string,
  roles: Partial<Roles>
): Promise<GoalStakeholder[]> {
  const stakeholderColSnap = await db.collection(`Goals/${goalId}/GStakeholders`).get()
  const stakeholders = stakeholderColSnap.docs.map(snap => createGoalStakeholder(toDate({ ...snap.data(), uid: snap.id })))
  const recipients = stakeholders.filter(stakeholder => {
    const { isAdmin, isAchiever, isSupporter, isSpectator } = stakeholder
    return roles.isAdmin === isAdmin || roles.isAchiever === isAchiever || roles.isSupporter === isSupporter || roles.isSpectator === isSpectator
  })

  return recipients
}

function createPushMessage(message: PushMessage, token: string): Message {
  const { link } = message
  return {
    token,
    notification: {
      title: message.title,
      body: message.body
    },
    data: { link },
    webpush: {
      notification: {
        icon: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9'
      },
      fcmOptions: { link }
    }
  }
}
