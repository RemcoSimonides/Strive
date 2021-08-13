import { enumEvent, Source } from '@strive/notification/+state/notification.firestore'
import { Support } from '@strive/support/+state/support.firestore'
import { sendNotificationToGoalStakeholders, sendNotificationToUsers, addDiscussion } from "../../../shared/notification/notification"
import { createNotification } from '@strive/notification/+state/notification.model';

export async function handleNotificationsOfCreatedSupport(supportId: string, goalId: string, support: Support) {

  const source: Source = {
    goal: support.goal,
    milestone: support.milestone,
    support
  }
  await addDiscussion(`Support '${support.description}'`, source, 'achievers', supportId)

  const notification = createNotification({
    id: goalId,
    discussionId: supportId,
    event: enumEvent.gSupportAdded,
    type: 'notification',
    source
  })
  sendNotificationToGoalStakeholders(goalId, notification, undefined, true)

}

export function handleNotificationsOfChangedSupport(supportId: string, goalId: string, before: Support, after: Support) {

  if (before.status !== after.status) {
    if (after.status === 'paid') {
      sendSupportPaidNotification(supportId, after)
    }

    if (after.status === 'rejected') {
      sendSupportRejectedNotification(supportId, goalId, after)
    }

    if (after.status === 'waiting_to_be_paid') {
      sendSupportIsWaitingToBePaid(supportId, after)
    }
  }
}

function sendSupportPaidNotification(supportId: string, support: Support) {

  if (!support.receiver.uid) return
  if (support.receiver.uid === support.supporter.uid) return

  const notification = createNotification({
    discussionId: supportId,
    event: enumEvent.gSupportPaid,
    type: 'notification',
    source: {
      goal: support.goal,
      support
    }
  })

  const receivers = support.receiver.uid ? [support.receiver.uid] : []

  sendNotificationToUsers(notification, receivers)
}

function sendSupportRejectedNotification(supportId: string, goalId: string, support: Support) {

  const notification = createNotification({
    discussionId: supportId,
    event: enumEvent.gSupportRejected,
    type: 'notification',
    source: {
      goal: support.goal,
      support
    }
  })
  sendNotificationToGoalStakeholders(goalId, notification, support.supporter.uid, true, true, false)  
}

function sendSupportIsWaitingToBePaid(supportId: string, support: Support) {

  if (!support.receiver || !support.receiver.uid) return
  if (support.receiver.uid === support.supporter.uid) return

  const notification = createNotification({
    discussionId: supportId,
    event: enumEvent.gSupportWaitingToBePaid,
    type: 'notification',
    source: {
      goal: support.goal,
      support
    }
  })

  const receivers: string[] = []
  receivers.push(support.receiver.uid ? support.receiver.uid : '')

  sendNotificationToUsers(notification, receivers)
}

export function sendSupportDeletedNotification(support: Support) {

  const notification = createNotification({
    discussionId: support.milestone.id ? support.milestone.id : support.goal.id,
    event: enumEvent.gSupportDeleted,
    type: 'notification',
    source: {
      goal: support.goal,
      milestone: support.milestone,
      support
    }
  })
  sendNotificationToUsers(notification, [support.supporter.uid])
}