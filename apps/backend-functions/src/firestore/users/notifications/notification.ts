import { db, admin, functions } from '../../../internals/firebase';
import { logger } from 'firebase-functions';
// Interfaces
import { createNotification, isSupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { NotificationSupport, Support } from '@strive/support/+state/support.firestore'
import { Personal } from '@strive/user/user/+state/user.firestore';
import { deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { getDocument } from '../../../shared/utils';
import { getPushMessage } from '@strive/notification/message/push-notification';

export const notificationCreatedHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
  .onCreate(async (snapshot, context) => {

    const notification = createNotification(snapshot.data())
    const userId = context.params.userId

    // send push notification
    const personal = await getDocument<Personal>(`Users/${userId}/Personal/${userId}`)

    logger.log(`gonna send notification to ${personal?.email}`)
    if (personal.fcmTokens.some(token => token)) {

      // TODO
      // Try to define a tag for each too so they get aggregated
      // Do so by getting the unread notifications.
      // Add clickaction to set notification to being read
      // GOOD LUCK!
      const message = getPushMessage(notification)
      
      logger.log('sending notification to devices', personal.fcmTokens)

      admin.messaging().sendToDevice(personal.fcmTokens, {
        notification: { ...message },
        data: { url: message.url }
      }).catch((err => {
        logger.error('error sending push notification', typeof err === 'object' ? JSON.stringify(err) : err)
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

    const before = createNotification({ ...snapshot.before.data(), id: snapshot.before.id })
    const after = createNotification({ ...snapshot.after.data(), id: snapshot.after.id })
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

    if (support.receiver.uid) {
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
