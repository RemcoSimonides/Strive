import { functions, admin, RuntimeOptions } from '@strive/api/firebase'
import { BigBatch } from './shared/bigbatch'

const config: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '1GB',
}

export const migrate = functions(config).https.onRequest(async (req, res) => {

  try {
    const firestore = admin.firestore()
    const batch = new BigBatch({ firestore })



    await batch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})

// CLEANING NOTIFICATIONS
// const batch = db.batch()
// const usersSnap = await db.collection('Users').get()
// for (const { id } of usersSnap.docs) {
//   const notificationsSnap = await db.collection(`Users/${id}/Notifications`).get()

//   const notifications = notificationsSnap.docs.map(doc => createNotificationBase({ ...doc.data(), id: doc.id }))
//   const goalIds = unique(notifications.filter(n => n.goalId).map(n => n.goalId))
//   const userIds = unique(notifications.filter(n => n.userId).map(n => n.userId))
//   const milestoneRefs = unique(notifications.filter(n => n.milestoneId).map(n => `Goals/${n.goalId}/Milestones/${n.milestoneId}`))
//   const supportRefs = unique(notifications.filter(n => n.supportId).map(n => `Goals/${n.goalId}/Supports/${n.supportId}`))

//   logger.log('goal ids: ', goalIds.length)

//   const goalPromises = goalIds.map(id => getDocument<Goal>(`Goals/${id}`))
//   const userPromises = userIds.map(id => getDocument<User>(`Users/${id}`))
//   const milestonePromises = milestoneRefs.map(ref => getDocument<Milestone>(ref))
//   const supportPromises = supportRefs.map(ref => getDocument<Milestone>(ref))

//   const goals = (await Promise.all(goalPromises)).filter(g => !!g)
//   const users = (await Promise.all(userPromises)).filter(u => !!u)
//   const milestones = (await Promise.all(milestonePromises)).filter(m => !!m)
//   const supports = (await Promise.all(supportPromises)).filter(s => !!s)

//   logger.log('users: ', users)

//   for (const doc of notificationsSnap.docs) {
//     const notification = notifications.find(n => n.id === doc.id)

//     const { goalId, supportId, milestoneId, userId } = notification

//     if (goalId) {
//       const goal = goals.find(({ id }) => id === goalId)
//       if (!goal) {
//         logger.log('goal does not exist: ', goalId)
//         batch.delete(doc.ref)
//       }
//     }

//     if (supportId) {
//       const support = supports.find(({ id }) => id === supportId)
//       if (!support) {
//         logger.log('support does not exist: ', supportId, goalId)
//         batch.delete(doc.ref)
//       }
//     }

//     if (milestoneId) {
//       const milestone = milestones.find(({ id }) => id === milestoneId)
//       if (!milestone) {
//         logger.log('milestone does not exist: ', milestoneId, goalId)
//         batch.delete(doc.ref)
//       }
//     }

//     if (userId) {
//       const user = users.find(({ uid }) => uid === userId)
//       if (!user) {
//         logger.log('user does not exist: ', userId)
//         batch.delete(doc.ref)
//       }
//     }
//   }
// }
// batch.commit()
