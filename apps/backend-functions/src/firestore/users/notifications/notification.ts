import { db, admin, functions, increment } from '../../../internals/firebase';
// Interfaces
import { createNotification, isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { NotificationSupport, Support } from '@strive/support/+state/support.firestore'
import { Profile } from '@strive/user/user/+state/user.firestore';
import { deleteScheduledTask, upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { Notification } from '@strive/notification/+state/notification.firestore';
import { getDocument } from 'apps/backend-functions/src/shared/utils';

export const notificationCreatedHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
  .onCreate(async (snapshot, context) => {

    const notification = createNotification(snapshot.data())
    const userId = context.params.userId
    const notificationId = snapshot.id

    // increment number of unread message
    incrementUnreadNotifications(userId)

    // send push notification
    const profile = await getDocument<Profile>(`Users/${userId}/Profile/${userId}`)

    console.log(`gonna send notification to ${profile.username}`)
    if (!!profile.fcmTokens.length) {

      const message = notification.message.map(msg => msg.text).join(' ')

      console.log('sending notification to devices', profile.fcmTokens)

      admin.messaging().sendToDevice(profile.fcmTokens, {
        notification: {
          title: `Something happened!`,
          body: message,
          clickAction: 'hello'
        }
      }).catch((err => {
        console.error('error sending push notification', err)
      }))

    }

    // SupportDecision
    if (isSupportDecisionNotification(notification)) {
      // deadline
      upsertScheduledTask(notificationId, {
        worker: enumWorkerType.notificationEvidenceDeadline,
        performAt: notification.meta.deadline,
        options: { userId, notificationId }
      })
    }
  })

export const notificationDeletedHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
  .onDelete(async (snapshot, context) => {
    const notificationId = snapshot.id
    deleteScheduledTask(notificationId)
  })

export const notificationChangeHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
  .onUpdate(async (snapshot, context) => {

    const before = snapshot.before.data() as Notification
    const after = snapshot.after.data() as Notification
    const notificationId = context.params.notificationId

    if (isSupportDecisionNotification(before) && isSupportDecisionNotification(after)) {
      // Support Decision
      if (before.meta.decisionStatus === 'pending' && after.meta.decisionStatus === 'finalized') {
        finalizeSupports(after.source.goalId, after.meta.supports)
        deleteScheduledTask(notificationId)
      }
    }
  })

async function finalizeSupports(goalId: string, supports: NotificationSupport[]): Promise<void> {

  for (const support of supports) {
    const ref = db.doc(`Goals/${goalId}/Supports/${support.id}`)

    if (!!support.receiver.uid) {
      const data: Partial<Support> = {
        receiver: support.receiver,
        status: 'waiting_to_be_paid'
      }
      ref.update(data)
    } else {
      // support rejected
      const data: Partial<Support> = { status: 'rejected' }
      ref.update(data)
    }
  }
}

function incrementUnreadNotifications(uid: string) {
  const ref = db.doc(`Users/${uid}/Profile/${uid}`)
  ref.update({ numberOfUnreadNotifications: increment(1) })
}
