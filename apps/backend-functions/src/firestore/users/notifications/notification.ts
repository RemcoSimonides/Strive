import { db, admin, functions, increment } from '../../../internals/firebase';
// Interfaces
import { createNotification, isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { NotificationSupport } from '@strive/support/+state/support.firestore'
import { Profile } from '@strive/user/user/+state/user.firestore';
import { deleteScheduledTask, upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { Notification } from '@strive/notification/+state/notification.firestore';

export const notificationCreatedHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
  .onCreate(async (snapshot, context) => {

    const notification = createNotification(snapshot.data())
    const userId = context.params.userId
    const notificationId = snapshot.id

    // increment number of unread message
    incrementUnreadNotifications(userId)

    // send push notification
    // get tokens
    const profileDocRef = db.doc(`Users/${userId}/Profile/${userId}`)
    const profileDocSnap = await profileDocRef.get()
    const profile = profileDocSnap.data() as Profile

    console.log(`gonna send notification to ${profile.username}`)
    if (profile.fcmTokens) {

      let message = ''
      notification.message.forEach(msg => {
        message = message + msg.text
      })

      console.log('sending notification to devices', profile.fcmTokens)

      await admin.messaging().sendToDevice(profile.fcmTokens as string[], {
        notification: {
            title: `Something happened!`,
            body: message,
            clickAction: 'hello'
        }
      }).catch((err => {
        console.log('error sending push notification', err)
      }))

    }

    // SupportDecision 
    if (isSupportDecisionNotification(notification)) {
      console.log('notificaiton is support decision');
      // deadline
      await upsertScheduledTask(notificationId, {
        worker: enumWorkerType.notificationEvidenceDeadline,
        performAt: notification.meta.deadline,
        options: {
            userId: userId,
            notificationId: notificationId
        }
      })
    }
  })

export const notificationDeletedHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
  .onDelete(async (snapshot, context) => {
    const notificationId = snapshot.id
    await deleteScheduledTask(notificationId)
  })

export const notificationChangeHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
  .onUpdate(async (snapshot, context) => {

    const before = snapshot.before.data() as Notification
    const after = snapshot.after.data() as Notification
    const notificationId = context.params.notificationId
    if (!before) return
    if (!after) return


    if (isSupportDecisionNotification(before) && isSupportDecisionNotification(after)) {
      // Support Decision
      if (before.meta.decisionStatus === 'pending' && after.meta.decisionStatus === 'finalized') {
        await finalizeSupports(after.source.goalId, after.meta.supports)
        await deleteScheduledTask(notificationId)
      }
    }
  })

async function finalizeSupports(goalId: string, supports: NotificationSupport[]): Promise<void> {

  supports.forEach(support => {
    const supportDocRef = db.doc(`Goals/${goalId}/Supports/${support.id}`)

    if (!support.receiver.uid) {

      // support rejected
      supportDocRef.update({
          status: 'rejected'
      })

    } else {

      // set receiver
      supportDocRef.update({
        receiver: support.receiver,
        status: 'waiting_to_be_paid'
      })
    }
  })
}

function incrementUnreadNotifications(uid: string) {
  const profileRef = db.doc(`Users/${uid}/Profile/${uid}`)
  profileRef.update({
    numberOfUnreadNotifications: increment(1)
  })
}
