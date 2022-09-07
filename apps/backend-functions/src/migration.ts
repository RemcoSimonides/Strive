import { createGoalStakeholder } from '@strive/model';
import { db, functions, logger } from './internals/firebase';
import { toDate } from './shared/utils';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    // const goalsSnap = await db.collection('Goals').get()
    // const goalBatch = db.batch()
    // const stakeholderBatch = db.batch()
    // for (const { id, ref } of goalsSnap.docs) {

    //   const stakeholdersSnap = await db.collection(`Goals/${id}/GStakeholders`).get()
    //   let counter = 0


    //   for (const doc of stakeholdersSnap.docs) {

    //     const stakeholder = createGoalStakeholder(toDate({ ...doc.data(), id: doc.id }))

    //     if ((stakeholder.isAdmin || stakeholder.isAchiever || stakeholder.isSupporter) && !stakeholder.isSpectator) {
    //       stakeholderBatch.update(doc.ref, {
    //         isSpectator: true
    //       })
    //     }

    //     if (stakeholder.isAdmin || stakeholder.isAchiever || stakeholder.isSupporter || stakeholder.isSpectator) {
    //       counter++
    //     }
    //   }

    //   goalBatch.update(ref, {
    //     numberOfSpectators: counter
    //   })
    // }

    // goalBatch.commit()
    // stakeholderBatch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})