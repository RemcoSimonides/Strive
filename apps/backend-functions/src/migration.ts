import { db, functions } from "./internals/firebase";

export const migrate = functions.https.onRequest(async (req, res) => {

  // try {
  //   const templatesSnap = await db.collectionGroup('Templates').get()
  //   const promises = []
  //   for (const doc of templatesSnap.docs) {
  //     const template = doc.data()

  //     template.roadmapTemplate = template.milestoneTemplateObject
  //     delete template.milestoneTemplateObject

  //     const promise = doc.ref.update(template)
  //     promises.push(promise)
  //   }
  //   await Promise.all(promises)

  //   res.status(200).send('all good')
  // } catch (err) {
  //   console.error(err)
  //   res.status(400).send('Oh no! ABORT!')
  // }
})