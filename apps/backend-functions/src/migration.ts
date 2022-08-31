import { createMilestone, createUser } from '@strive/model';
import { db, functions, logger } from './internals/firebase';
import { toDate } from './shared/utils';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {
    // const goalsSnap = await db.collection('Goals').get()
    // const batch = db.batch()

    // for (const { id } of goalsSnap.docs) {

    //   const milestonesSnap = await db.collection(`Goals/${id}/Milestones`).get()
    //   for (const doc of milestonesSnap.docs) {

    //     const milestone = createMilestone(doc.data())

    //     if (milestone.description) {
    //       batch.update(doc.ref, { description: '' })
    //     }

    //   }
    // }
    // await batch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})