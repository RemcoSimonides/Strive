import * as admin from 'firebase-admin';
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { AudienceType, Discussion } from '@strive/discussion/+state/discussion.firestore';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createCollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore'
import { ISource, Notification } from '@strive/notification/+state/notification.firestore';

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

// create discussion
export async function createDiscussion(title: string, source: ISource, audience: AudienceType, id?: string, stakeholderUID?: string): Promise<string> {

  const commentators: string[] = []
  // already add requestor as commentator --> if admin says something in discussion, requestor will receive notification of it
  if (!!stakeholderUID) {
    commentators.push(stakeholderUID)
  }

  const discussion: Discussion = {
    title: title,
    audience: audience,
    source: source,
    commentators: commentators,
    numberOfComments: 0
  }

  if (!!id) {
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

export async function sendNotificationToCollectiveGoalStakeholders(collectiveGoalId: string, notification: Partial<Notification>, isAdmin: boolean, isAchiever: boolean) {

  console.log('executing Send Notification to Collective Goal Stakeholder(s)')
  const receivers = await getCollectiveGoalStakeholders(collectiveGoalId, isAdmin, isAchiever)
  return sendNotificationToUsers(notification, receivers)

}

async function getCollectiveGoalStakeholders(collectiveGoalId: string, isAdmin: boolean, isAchiever: boolean): Promise<string[]> {

  const stakeholderColSnap = await db.collection(`CollectiveGoals/${collectiveGoalId}/CGStakeholders`).get()
  const receivers: string[] = []

  for (const snap of stakeholderColSnap.docs) {
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
  console.log(`executing Send Notification to Goal ${goalId}`)

  notification.updatedAt = serverTimestamp() as Timestamp
  notification.createdAt = serverTimestamp() as Timestamp

  if (!!notification.id) {
    console.log(`adding notification to goal ${goalId} with notificationId ${notification.id}`, notification)
    db.doc(`Goals/${goalId}/Notifications/${notification.id}`).set(notification)
  } else {
    console.log(`adding notification to goal ${goalId}`, notification)
    db.collection(`Goals/${goalId}/Notifications`).add(notification)
  }

  console.log('also sending notification to discussion')
  // Add notification to discussion too
  if (!notification.source.milestoneId && !notification.source.supportId) {
    console.log('sending to goal')

    // send notification in goal discussion
    // TODO use createComment({}) here
    db.collection(`Discussions/${goalId}/Comments`).add({
      text: `${notification.message.map(messageObj => messageObj.text).join(' ')}`,
      type: 1,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    })
  } else if (notification.source.milestoneId) {

    console.log('sending to milestone')
    // send notification in milestone discussion
    db.collection(`Discussions/${notification.source.milestoneId}/Comments`).add({
      text: `${notification.message?.map(messageObj => messageObj.text).join(' ')}`,
      type: 1,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    })

  } else {
    console.log('no discussino for notification', notification)
  }
}

/**
 * 
 * @param goalId 
 * @param notification Check notification interface to see when to pass which data
 * @param isAdmin True if you want a goal stakeholder with this right to receive the notification, False if you don't want them  to receive it, and undefined if you don't care if they receive it or not
 * @param isAchiever True if you want a goal stakeholder with this right to receive the notification, False if you don't want them  to receive it, and undefined if you don't care if they receive it or not
 * @param isSupporter True if you want a goal stakeholder with this right to receive the notification, False if you don't want them  to receive it, and undefined if you don't care if they receive it or not
 */
export async function sendNotificationToGoalStakeholders(goalId: string, notification: Partial<Notification>, isAdmin?: boolean, isAchiever?: boolean, isSupporter?: boolean) {
  const receivers = await getGoalStakeholders(goalId, isAdmin, isAchiever, isSupporter)
  console.log('receivers: ', receivers)
  return sendNotificationToUsers(notification, receivers)
}

async function getGoalStakeholders(goalId: string, isAdmin?: boolean,  isAchiever?: boolean, isSupporter?: boolean): Promise<string[]> {

  const stakeholderColSnap = await db.collection(`Goals/${goalId}/GStakeholders`).get() 
  const receivers: string[] = []

  for (const snap of stakeholderColSnap.docs) {
    const stakeholder = createGoalStakeholder(snap.data())
    if (isAdmin === stakeholder.isAdmin || isAchiever === stakeholder.isAchiever || isSupporter === stakeholder.isSupporter) {
      receivers.push(snap.id)
    }
  }

  return receivers
}

export async function sendNotificationToUserSpectators(uid: string, notification: Partial<Notification>) {

  // get all spectators
  const userSpectatorColSnap = await db.collection(`Users/${uid}/Spectators`)
    .where('isSpectator', '==', true)
    .get()
  const receivers = userSpectatorColSnap.docs.map(doc => doc.id)
  return sendNotificationToUsers(notification, receivers)

}

