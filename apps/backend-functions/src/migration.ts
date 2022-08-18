import { functions } from './internals/firebase';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    // const [goalEventsSnap, goals, users] = await Promise.all([
    //   db.collection(`GoalEvents`).get(),
    //   getCollection<Goal>('Goals'),
    //   getCollection<User>('Users')
    // ])

    // logger.log('size: ', goalEventsSnap.size)

    // const batch = db.batch()
    // for (const doc of goalEventsSnap.docs) {
    //   const event = createGoalEvent(toDate(doc.data()))
    //   const value = map[event.name]

    //   if (!value) {
    //     batch.delete(doc.ref)
    //     continue
    //   }
      
    //   event.name = value
    //   batch.update(doc.ref, { ...event })
    // }

    // batch.commit()

    // for (const goal of goals) {
    //   const storySnap = await db.collection(`Goals/${goal.id}/Story`).get()
    //   const storyBatch = db.batch()
    //   logger.log('story size: ', storySnap.size)

    //   for (const doc of storySnap.docs) {
    //     const event = createStoryItem(toDate(doc.data()))
    //     const value = map[event.name]
  
    //     if(!value) {
    //       storyBatch.delete(doc.ref)
    //       continue
    //     }
  
    //     event.name = value
    //     storyBatch.update(doc.ref, { ...event })
    //   }
    //   storyBatch.commit()
    // }

    // for (const user of users) {
    //   const notificationsSnap = await db.collection(`Users/${user.uid}/Notifications`).get()
    //   const notificationBatch = db.batch()
    //   logger.log('notifications: ', notificationsSnap.size)

    //   for (const doc of notificationsSnap.docs) {
    //     const notification = createNotification(toDate(doc.data()))
    //     const value = map[notification.event]

    //     if (!value) {
    //       notificationBatch.delete(doc.ref)
    //       continue
    //     }

    //     notification.event = value
    //     notificationBatch.update(doc.ref, { ...notification })
    //   }
    //   notificationBatch.commit()
    // }

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})