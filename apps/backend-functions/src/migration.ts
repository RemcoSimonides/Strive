import { createStoryItem } from '@strive/model';
import { db, functions, logger } from './internals/firebase';
import { toDate } from './shared/utils';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    // const goalsSnap = await db.collection('Goals').get()

    // const batch = db.batch()
    // for (const { id } of goalsSnap.docs) {

    //   const storySnap = await db.collection(`Goals/${id}/Story`).get()

    //   for (const doc of storySnap.docs) {
    //     const storyItem = createStoryItem(toDate({ ...doc.data(), id: doc.id }))
    //     if (storyItem.name === 'goalSupportCreated') {
    //       batch.delete(doc.ref)
    //     }
    //   }
    // }
    // batch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})