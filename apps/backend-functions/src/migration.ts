import { db, functions } from "./internals/firebase";

export const migrate = functions.https.onRequest(async (req, res) => {

  // try {
  //   const goalsSnap = await db.collection('Goals').get()
  //   const promises = []
  //   for (const doc of goalsSnap.docs) {
  //     const goal = doc.data()

  //     goal.roadmapTemplate = goal.milestoneTemplateObject
  //     delete goal.milestoneTemplateObject

  //     const promise = doc.ref.update(goal);
  //     promises.push(promise)
  //   }
  //   await Promise.all(promises)
  //   res.status(200).send('all good')
  // } catch(err) {
  //   res.status(400).send('Oh no! ABORT!')
  // }
})