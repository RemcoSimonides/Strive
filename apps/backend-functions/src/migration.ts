import { createGoalEvent } from "@strive/goal/goal/+state/goal.firestore";
import { createGoalSource, createSupportSource } from "@strive/notification/+state/notification.firestore";
import { createNotification } from "@strive/notification/+state/notification.model";
import { functions, db } from "./internals/firebase";
import { logger } from 'firebase-functions';
import { createSupport } from "@strive/support/+state/support.firestore";
import { createPersonal } from "@strive/user/user/+state/user.firestore";
import { subMonths } from "date-fns";
import { createGoalStakeholder } from "@strive/goal/stakeholder/+state/stakeholder.firestore";

export const migrate = functions.https.onRequest(async (req, res) => {

  try {
    const notificationsSnap = await db.collectionGroup('Notifications').get()
    const notifications = notificationsSnap.docs.filter(snap => snap.ref.path.includes('Goals'))
    const userNotifications = notificationsSnap.docs.filter(snap => snap.ref.path.includes('Users'))
    logger.log('number of goal notifications: ', notifications.length)
    logger.log('number of user notifications: ', userNotifications.length)
    
    const notificationBatch = db.batch()
    for (const doc of notifications) {
      const notification = doc.data()
      
      const event = createGoalEvent({
        name: notification.event,
        createdAt: notification.createdAt,
        updatedAt: notification.updatedAt,
        source: createGoalSource(notification.source)
      })

      const postId = notification.source?.postId
      const id = postId ? postId : doc.id
      const ref = db.doc(`GoalEvents/${id}`)

      notificationBatch.set(ref, event)
      notificationBatch.delete(doc.ref)
    }
    notificationBatch.commit()

    const userBatch = db.batch()
    for (const doc of userNotifications) {
      const before = doc.data()
      const notification = createNotification({
        event: before.event,
        source: before.source,
        createdAt: before.createdAt,
        updatedAt: before.updatedAt
      })
      userBatch.set(doc.ref, notification)
    }
    userBatch.commit()


    const supportsSnap = await db.collectionGroup('Supports').get()
    const withoutNewSupports = supportsSnap.docs.filter(doc => !doc.data().source)
    logger.log('number of supports: ', withoutNewSupports.length)

    const supportBatch = db.batch()
    for (const doc of withoutNewSupports) {
      const before = doc.data()
      const support = createSupport({
        createdAt: before.createdAt,
        updatedAt: before.updatedAt,
        description: before.description,
        status: before.status,
        source: createSupportSource({
          goal: before.goal,
          supporter: before.supporter,
          receiver: before.receiver,
          milestone: before.milestone
        })
      })
      if (before.amount) support.amount = before.amount
      
      supportBatch.set(doc.ref, support)
    }
    supportBatch.commit()

    const monthAgo = subMonths(new Date(), 1)

    const personalBatch = db.batch()
    const personalsSnap = await db.collectionGroup('Personal').get()
    for (const doc of personalsSnap.docs) {
      const personal = createPersonal(doc.data())
      personal.lastCheckedNotifications = monthAgo
      personalBatch.set(doc.ref, personal)
    }
    personalBatch.commit()

    const stakeholderBatch = db.batch()
    const stakeholdersSnap = await db.collectionGroup('GStakeholders').get()
    for (const doc of stakeholdersSnap.docs) {
      const stakeholder = createGoalStakeholder(doc.data())
      stakeholder.lastCheckedGoal = monthAgo
      stakeholderBatch.set(doc.ref,stakeholder)
    }
    stakeholderBatch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})