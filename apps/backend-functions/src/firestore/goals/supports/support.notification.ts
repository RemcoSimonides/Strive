import * as admin from 'firebase-admin'
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { enumDiscussionAudience } from '@strive/interfaces'
import { enumEvent } from '@strive/notification/+state/notification.firestore'
import { Support } from '@strive/support/+state/support.firestore'
import { sendNotificationToGoalStakeholders, sendNotificationToUsers, createDiscussion } from "../../../shared/notification/notification"
import { enumImage } from '@strive/interfaces';
import { createGoal, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { createNotification } from '@strive/notification/+state/notification.model';

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

export async function handleNotificationsOfCreatedSupport(supportId: string, goalId: string, support: Support): Promise<void> {

  await createDiscussion(`Support '${support.description}'`, { image: support.goal.image, name: support.goal.title, goalId: support.goal.id }, enumDiscussionAudience.achievers, supportId)
  await sendNewSupportNotificationToAchieversOfGoal(supportId, goalId, support)
}

export async function handleNotificationsOfChangedSupport(supportId: string, goalId: string, before: Support, after: Support): Promise<void> {

  if (before.status !== after.status) {
    if (after.status === 'paid') {
      await sendSupportPaidNotification(supportId, after)
    }

    if (after.status === 'rejected') {
      await sendSupportRejectedNotification(supportId, goalId, after)
    }

    if (after.status === 'waiting_to_be_paid') {
      await sendSupportIsWaitingToBePaid(supportId, after)
    }
  }
}

function sendNewSupportNotificationToAchieversOfGoal(supportId: string, goalId: string, support: Support) {

  //Prepare notification object
  const newNotification = createNotification({
    id: goalId,
    discussionId: supportId,
    event: enumEvent.gSupportAdded,
    source: {
      image: support.goal.image,
      name: support.goal.title,
      goalId: goalId,
      supportId: supportId
    },
    message: [
      {
        text: support.supporter.username,
        link: `profile/${support.supporter.uid}`
      },
      {
        text: support.milestone && support.milestone.description ? ` is now supporting milestone ${support.milestone.description}` : ` is now supporting`
      },
      {
        text: ` with ${support.description}`
      }
    ],
    isRead: false,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp
  })
  sendNotificationToGoalStakeholders(goalId, newNotification, undefined, true)
}

function sendSupportPaidNotification(supportId: string, support: Support) {

  if (!support.receiver || !support.receiver.uid) return
  if (support.receiver.uid === support.supporter.uid) return

  const notification = createNotification({
    discussionId: supportId,
    event: enumEvent.gSupportPaid,
    source: {
      image: support.goal.image,
      name: support.goal.title,
      goalId: support.goal.id,
      supportId: supportId
    },
    message: [
      {
        text: support.supporter.username,
        link: `profile/${support.supporter.uid}`
      },
      {
        text: ` paid support '${support.description}'`
      }
    ]
  })

  const receivers: string[] = []
  receivers.push(support.receiver.uid ? support.receiver.uid : '')

  sendNotificationToUsers(notification, receivers)
}

function sendSupportRejectedNotification(supportId: string, goalId: string, support: Support) {

  const notification = createNotification({
    discussionId: supportId,
    event: enumEvent.gSupportRejected,
    source: {
      image: support.goal.image,
      name: support.goal.title,
      goalId: goalId,
      supportId: supportId
    },
  })

  if (support.milestone) {
    notification.message = [
      {
        text: support.supporter.username,
        link: `profile/${support.supporter.uid}`
      },
      {
        text: ` rejected paying support '${support.description}' for milestone '${support.milestone.description}' in goal '`
      },
      {
        text: support.goal.title,
        link: `goal/${support.goal.id}`
      },
      {
        text: `'`
      } 
    ]
  } else {
    notification.message = [
      {
        text: support.supporter.username,
        link: `profile/${support.supporter.uid}`
      },
      {
          text: ` rejected paying support '${support.description}' for goal '`
      },
      {
          text: support.goal.title,
          link: `goal/${support.goal.id}`
      },
      {
          text: `'`
      }
    ]
  }    
  sendNotificationToGoalStakeholders(goalId, notification, true, true, false)  
}

function sendSupportIsWaitingToBePaid(supportId: string, support: Support) {

  if (!support.receiver || !support.receiver.uid) return
  if (support.receiver.uid === support.supporter.uid) return

  const notification = createNotification({
    discussionId: supportId,
    event: enumEvent.gSupportWaitingToBePaid,
    source: {
      image: support.goal.image,
      name: support.goal.title,
      goalId: support.goal.id,
      supportId: supportId
    },
    message: [
      {
        text: support.supporter.username,
        link: `profile/${support.supporter.uid}`
      },
      {
        text: ` is going to give you the support '${support.description}' :)`
      }
    ]
  })

  const receivers: string[] = []
  receivers.push(support.receiver.uid ? support.receiver.uid : '')

  sendNotificationToUsers(notification, receivers)
}

export async function sendSupportDeletedNotification(goalId: string, supportId: string,  support: Support) {

  // get goal doc for image
  const goalDocRef = db.doc(`Goals/${goalId}`)
  const goalDocSnap = await goalDocRef.get()
  const goal = createGoal(goalDocSnap.data())

  // send notification
  if (!!support.milestone) {

    // because milestone has been deleted
    const notification = createNotification({
      discussionId: support.milestone.id,
      event: enumEvent.gSupportDeleted,
      source: {
        image: goal.image,
        name: goal.title,
        goalId: goalId,
        milestoneId: support.milestone.id,
        supportId: supportId
      },
      message: [
        {
          text: `Support '${support.description}' has been deleted because milestone '${support.milestone.description}' has been deleted`
        }
      ]
    })
    sendNotificationToUsers(notification, [support.supporter.uid])
  } else {
      
    // because goal has been deleted
    const notification = createNotification({
      discussionId:  support.goal.id,
      event: enumEvent.gSupportDeleted,
      source: {
        image: goal.image,
        name:  goal.title,
        goalId: goalId,
        supportId: supportId
      },
      message: [
        {
          text: `Support '${support.description}' has been deleted because goal '${support.goal.title}' has been deleted`
        }
      ]
    })
    sendNotificationToUsers(notification, [support.supporter.uid])
  }
}