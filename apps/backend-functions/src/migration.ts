import { createSupport } from '@strive/model';
import { db, functions, logger } from './internals/firebase';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    const supportsSnap = await db.collectionGroup('Supports').get()

    logger.log('supportsSnap size: ', supportsSnap.size)

    for (const doc of supportsSnap.docs) {

      const data = doc.data()
      const support = createSupport(data)

      logger.log('support: ', support)
    }

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

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})