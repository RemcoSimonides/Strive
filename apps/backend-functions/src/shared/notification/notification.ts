import * as admin from 'firebase-admin';
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { IDiscussion, enumDiscussionAudience } from '@strive/interfaces';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createCollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore'
import { ISource, Notification } from '@strive/notification/+state/notification.firestore';
// import { } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore'

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

// create discussion
export async function createDiscussion(title: string, source: ISource, audience: enumDiscussionAudience, id?: string, stakeholderUID?: string): Promise<string> {

  const commentators: string[] = []
  // already add requestor as commentator --> if admin says something in discussion, requestor will receive notification of it
  if (!!stakeholderUID) {
    commentators.push(stakeholderUID)
  }

  const discussion: IDiscussion = {
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

export async function sendNotificationToUsers(notification: Partial<Notification>, receivers: string[]) {

  notification.updatedAt = serverTimestamp() as Timestamp
  notification.createdAt = serverTimestamp() as Timestamp

  const promises: any[] = []
  receivers.forEach(receiver => {

    if (!!notification.id) {
      promises.push(db.doc(`Users/${receiver}/Notifications/${notification.id}`).set(notification))
    } else {
      promises.push(db.collection(`Users/${receiver}/Notifications`).add(notification))
    }

  })
  await Promise.all(promises)
}

export async function sendNotificationToCollectiveGoalStakeholders(collectiveGoalId: string, notification: Partial<Notification>, isAdmin: boolean, isAchiever: boolean) {

  console.log('executing Send Notification to Collective Goal Stakeholder(s)')
  const receivers: string[] = await getCollectiveGoalStakeholders(collectiveGoalId, isAdmin, isAchiever)
  await sendNotificationToUsers(notification, receivers)

}

async function getCollectiveGoalStakeholders(collectiveGoalId: string, isAdmin: boolean, isAchiever: boolean): Promise<string[]> {

  const stakeholderColRef = db.collection(`CollectiveGoals/${collectiveGoalId}/CGStakeholders`)
  const stakeholderColSnap = await stakeholderColRef.get()
  const receivers: string[] = []
  stakeholderColSnap.docs.forEach(stakeholderSnap => {

    const stakeholder = createCollectiveGoalStakeholder(stakeholderSnap.data())
    if (stakeholder.isAdmin === isAdmin || stakeholder.isAchiever === isAchiever) {
      receivers.push(stakeholderSnap.id)
    }

  })

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

  if (notification.id) {
    const id = notification.id
    delete notification.id
    console.log(`adding notification to goal ${goalId} with notificationId ${id}`, notification)
    db.doc(`Goals/${goalId}/Notifications/${id}`).set(notification)
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
  const receivers: string[] =  await getGoalStakeholders(goalId, isAdmin, isAchiever, isSupporter)
  console.log('receivers: ', receivers)
  await sendNotificationToUsers(notification, receivers)
}

async function getGoalStakeholders(goalId: string, isAdmin?: boolean,  isAchiever?: boolean, isSupporter?: boolean): Promise<string[]> {

  const stakeholderColRef = db.collection(`Goals/${goalId}/GStakeholders`)
  const stakeholderColSnap = await stakeholderColRef.get() 
  const receivers: string[] = []
  stakeholderColSnap.docs.forEach(stakeholderSnap => {

    const stakeholder = createGoalStakeholder(stakeholderSnap.data())
    if (isAdmin === stakeholder.isAdmin || isAchiever === stakeholder.isAchiever || isSupporter === stakeholder.isSupporter) {
      receivers.push(stakeholderSnap.id)
    }
  })
  return receivers
}

export async function sendNotificationToUserSpectators(uid: string, notification: Partial<Notification>): Promise<void> {

  // get all spectators
  const userSpectatorColRef = db.collection(`Users/${uid}/Spectators`).where('isSpectator', '==', true)
  const userSpectatorColSnap = await userSpectatorColRef.get()
  const receivers: string[] = userSpectatorColSnap.docs.map(doc => doc.id)
  await sendNotificationToUsers(notification, receivers)

}

