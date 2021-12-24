import { db, functions } from "./internals/firebase";
import { createMilestone } from "@strive/milestone/+state/milestone.firestore";

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    const milestonesSnap = await db.collectionGroup('Milestones').get();

    const promises = []

    for (const doc of milestonesSnap.docs) {
      const milestone = createMilestone(doc.data())
      milestone.order = +milestone.sequenceNumber.split('.')[0];

      const promise = db.doc(doc.ref.path).set(milestone)
      promises.push(promise)
    }

    await Promise.all(promises)

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})