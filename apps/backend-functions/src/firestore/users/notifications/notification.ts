import { db, admin, functions } from '../../../internals/firebase';
// Interfaces
import { createNotification, isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { NotificationSupport, Support } from '@strive/support/+state/support.firestore'
import { Profile } from '@strive/user/user/+state/user.firestore';
import { deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { Notification } from '@strive/notification/+state/notification.firestore';
import { getDocument } from '../../../shared/utils';
import { getPushMessage } from '@strive/notification/message/push-notification';

export const notificationCreatedHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
  .onCreate(async (snapshot, context) => {

    const notification = createNotification(snapshot.data())
    const userId = context.params.userId
    const notificationId = snapshot.id

    // send push notification
    const profile = await getDocument<Profile>(`Users/${userId}/Profile/${userId}`)

    console.log(`gonna send notification to ${profile.username}`)
    if (!!profile.fcmTokens.length) {

      // TODO
      // Try to define a tag for each too so they get aggregated
      // Do so by getting the unread notifications.
      // Add clickaction to set notification to being read
      // GOOD LUCK!
      const message = getPushMessage(notification)
      
      console.log('sending notification to devices', profile.fcmTokens)

      admin.messaging().sendToDevice(profile.fcmTokens, {
        notification: { ...message },
        data: { url: message.url }
      }).catch((err => {
        console.error('error sending push notification', typeof err === 'object' ? JSON.stringify(err) : err)
      }))

    }
  })

export const notificationDeletedHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
  .onDelete(async snapshot => {
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
      if (before.meta.status === 'pending' && after.meta.status === 'finalized') {
        finalizeSupports(after.source.goal.id, after.meta.supports)
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
