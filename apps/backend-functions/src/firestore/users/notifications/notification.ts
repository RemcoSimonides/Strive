import { db, admin, functions, increment } from '../../../internals/firebase';
// Interfaces
import { enumNotificationType, INotification } from '@strive/interfaces';
import { NotificationSupport } from '@strive/support/+state/support.firestore'
import { Profile } from '@strive/user/user/+state/user.firestore';
import { deleteScheduledTask, upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'

export const notificationCreatedHandler = functions.firestore.document(`Users/{userId}/Notifications/{notificationId}`)
    .onCreate(async (snapshot, context) => {

        const notification: INotification = Object.assign(<INotification>{}, snapshot.data())
        const userId = context.params.userId
        const notificationId = snapshot.id
        if (!notification) return

        // increment number of unread message
        await incrementUnreadNotifications(userId)

        // send push notification
        // get tokens
        const profileDocRef: admin.firestore.DocumentReference = db.doc(`Users/${userId}/Profile/${userId}`)
        const profileDocSnap: admin.firestore.DocumentSnapshot = await profileDocRef.get()
        const profile: Profile = Object.assign(<Profile>{}, profileDocSnap.data())

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

        // deadline
        if (notification['deadline']) {
            await upsertScheduledTask(notificationId, {
                worker: enumWorkerType.notificationEvidenceDeadline,
                performAt: notification['deadline'],
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

        const before = snapshot.before.data()
        const after = snapshot.after.data()
        const notificationId = context.params.notificationId
        if (!before) return
        if (!after) return

        if (before.notificationType !== after.notificationType) {

            if (after.notificationType === enumNotificationType.evidence_finalized) {

                await finalizeSupports(after.path.goalId, after.supports)
                await deleteScheduledTask(notificationId)

            }

        }

    })

async function finalizeSupports(goalId: string, supports: NotificationSupport[]): Promise<void> {

    supports.forEach(async support => {

        const supportDocRef = db.doc(`Goals/${goalId}/Supports/${support.id}`)

        if (support.receiverId === null) {

            // support rejected
            await supportDocRef.update({
                status: 'rejected'
            })

        } else {

            // set receiver
            await supportDocRef.update({
                receiver: {
                    uid: support.receiverId,
                    username: support.receiverUsername,
                    photoURL:  support.receiverPhotoURL
                },
                status: 'waiting_to_be_paid'
            })

        }

    })

}

async function incrementUnreadNotifications(uid: string): Promise<void> {

    const profileRef = db.doc(`Users/${uid}/Profile/${uid}`)
    await profileRef.update({
        numberOfUnreadNotifications: increment(1)
    })

}
