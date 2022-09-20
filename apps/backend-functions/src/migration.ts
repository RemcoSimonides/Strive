import { createGoalEvent } from '@strive/model';
import { db, functions, logger } from './internals/firebase';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {
    let counter = 0

    const eventsSnap = await db.collection('GoalEvents').get()

    const chunkSize = 500;
    for (let i = 0; i < eventsSnap.size; i += chunkSize) {
      const chunk = eventsSnap.docs.slice(i, i + chunkSize);

      counter = 0
      const batch = db.batch()
      for (const doc of chunk) {
        const data = doc.data()
  
        const event = createGoalEvent({
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          goalId: data.source.goal.id,
          name: data.name,
          commentId: data.source.comment?.id,
          milestoneId: data.source.milestone?.id,
          postId: data.source.postId,
          supportId: data.source.support?.id,
          userId: data.source.user?.uid
        })
  
        counter++
        batch.set(doc.ref, event)
      }
      logger.log('counter: ', counter)
      await batch.commit()
      
    }

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
