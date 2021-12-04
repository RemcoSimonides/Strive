import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { AudienceType, createDiscussion } from '@strive/discussion/+state/discussion.firestore';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createCollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore'
import { Source, Notification } from '@strive/notification/+state/notification.firestore';

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

// create discussion
export async function addDiscussion(title: string, source: Source, audience: AudienceType, id?: string, stakeholderUID?: string): Promise<string> {

  // already add requestor as commentator --> if admin says something in discussion, requestor will receive notification of it
  const commentators = stakeholderUID ? [stakeholderUID] : []

  const discussion = createDiscussion({
    id: id ?? '',
    title,
    source,
    audience,
    commentators,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp
  })

  if (id) {
    await db.doc(`Discussions/${id}`).set(discussion)
    return id
  } else {
    const res = await db.collection(`Discussions`).add(discussion)
    return res.id
  }
}

export function sendNotificationToUsers(notification: Partial<Notification>, receivers: string[]) {
  notification.updatedAt = serverTimestamp() as Timestamp
  notification.createdAt = serverTimestamp() as Timestamp

  const promises: Promise<any>[] = receivers.map(receiver => {
    if (!!notification.id) {
      return db.doc(`Users/${receiver}/Notifications/${notification.id}`).set(notification)
    } else {
      return db.collection(`Users/${receiver}/Notifications`).add(notification)
    }
  })
  return Promise.all(promises)
}

/**
 * 
 * @param collectiveGoalId 
 * @param notification 
 * @param except UID of user who doesnt receive the notification (e.g. the user who triggered the notification)
 * @param isAdmin 
 * @param isAchiever 
 * @returns 
 */
export async function sendNotificationToCollectiveGoalStakeholders(collectiveGoalId: string, notification: Partial<Notification>, except: string, isAdmin: boolean, isAchiever: boolean) {

  logger.log('executing Send Notification to Collective Goal Stakeholder(s)')
  notification.target = 'stakeholder'
  const receivers = await getCollectiveGoalStakeholders(collectiveGoalId, except, isAdmin, isAchiever)
  return sendNotificationToUsers(notification, receivers)

}

async function getCollectiveGoalStakeholders(collectiveGoalId: string, except: string, isAdmin: boolean, isAchiever: boolean): Promise<string[]> {

  const stakeholderColSnap = await db.collection(`CollectiveGoals/${collectiveGoalId}/CGStakeholders`).get()
  const receivers: string[] = []

  for (const snap of stakeholderColSnap.docs) {
    if (snap.id === except) continue
    const stakeholder = createCollectiveGoalStakeholder(snap.data())
    if (stakeholder.isAdmin === isAdmin || stakeholder.isAchiever === isAchiever) {
      receivers.push(snap.id)
    }
  }

  return receivers
}

/**
 * 
 * @param goalId 
 * @param notification Check notification interface to see when to pass which data 
 */
export function sendNotificationToGoal(goalId: string, notification: Partial<Notification>) {
  logger.log(`executing Send Notification to Goal ${goalId}`)

  notification.updatedAt = serverTimestamp() as Timestamp
  notification.createdAt = serverTimestamp() as Timestamp
  notification.target = 'goal'

  if (notification.id) {
    logger.log(`adding notification to goal ${goalId} with notificationId ${notification.id}`, JSON.stringify(notification))
    db.doc(`Goals/${goalId}/Notifications/${notification.id}`).set(notification)
  } else {
    logger.log(`adding notification to goal ${goalId}`, JSON.stringify(notification))
    db.collection(`Goals/${goalId}/Notifications`).add(notification)
  }

  // console.log('also sending notification to discussion')
  // Add notification to discussion too
  // if (!notification.source.milestone.id && !notification.source.support.id ) {
    // console.log('sending to goal')

    // send notification in goal discussion
    // TODO use createComment({}) here
    // db.collection(`Discussions/${goalId}/Comments`).add({
    //   text: `${notification.message.map(messageObj => messageObj.text).join(' ')}`,
    //   type: 1,
    //   createdAt: serverTimestamp() as Timestamp,
    //   updatedAt: serverTimestamp() as Timestamp
    // })
  // } else if (notification.source.milestone.id) {

    // console.log('sending to milestone')
    // send notification in milestone discussion
    // db.collection(`Discussions/${notification.source.milestoneId}/Comments`).add({
    //   text: `${notification.message?.map(messageObj => messageObj.text).join(' ')}`,
    //   type: 1,
    //   createdAt: serverTimestamp() as Timestamp,
    //   updatedAt: serverTimestamp() as Timestamp
    // })

  // } else {
  //   console.log('no discussino for notification', notification)
  // }
}

/**
 * 
 * @param goalId 
 * @param notification Check notification interface to see when to pass which data
 * @param except UID of user who doesnt receive the notification (e.g. the user who triggered the notification)
 * @param isAdmin True if you want a goal stakeholder with this right to receive the notification, False if you don't want them  to receive it, and undefined if you don't care if they receive it or not
 * @param isAchiever True if you want a goal stakeholder with this right to receive the notification, False if you don't want them  to receive it, and undefined if you don't care if they receive it or not
 * @param isSupporter True if you want a goal stakeholder with this right to receive the notification, False if you don't want them  to receive it, and undefined if you don't care if they receive it or not
 */
export async function sendNotificationToGoalStakeholders(goalId: string, notification: Partial<Notification>, except: string, isAdmin?: boolean, isAchiever?: boolean, isSupporter?: boolean) {
  notification.target = 'stakeholder'
  const receivers = await getGoalStakeholders(goalId, except, isAdmin, isAchiever, isSupporter)
  return sendNotificationToUsers(notification, receivers)
}

async function getGoalStakeholders(goalId: string, except: string, isAdmin?: boolean,  isAchiever?: boolean, isSupporter?: boolean): Promise<string[]> {

  const stakeholderColSnap = await db.collection(`Goals/${goalId}/GStakeholders`).get() 
  const receivers: string[] = []

  for (const snap of stakeholderColSnap.docs) {
    if (snap.id === except) continue
    const stakeholder = createGoalStakeholder(snap.data())
    if (isAdmin === stakeholder.isAdmin || isAchiever === stakeholder.isAchiever || isSupporter === stakeholder.isSupporter) {
      receivers.push(snap.id)
    }
  }

  return receivers
}

export async function sendNotificationToUserSpectators(uid: string, notification: Partial<Notification>) {

  notification.target = 'spectator'

  // get all spectators
  const userSpectatorColSnap = await db.collection(`Users/${uid}/Spectators`)
    .where('isSpectator', '==', true)
    .get()
  const receivers = userSpectatorColSnap.docs.map(doc => doc.id)
  return sendNotificationToUsers(notification, receivers)

}

