import { Goal } from "@strive/goal/goal/+state/goal.firestore";
import { GoalStakeholder } from "@strive/goal/stakeholder/+state/stakeholder.firestore";
import { db, functions } from "./internals/firebase";
import { logger } from 'firebase-functions';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    // const goalsSnap = await db.collection('Goals').get()

    // const promises = []
    // for (const doc of goalsSnap.docs) {
    //   const goal = doc.data() as Goal

    //   const goalStakeholdersSnap = await db.collectionGroup('GStakeholders').get()

    //   for (const snap of goalStakeholdersSnap.docs) {
    //     const stakeholder = snap.data() as GoalStakeholder
    //     stakeholder.status = goal.status
    //     const promise = snap.ref.update(stakeholder)
    //     promises.push(promise)
    //   }
    // }
    // await Promise.all(promises)

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})