import { db, functions } from "./internals/firebase";
import { createNotification } from "@strive/notification/+state/notification.model";
import { createSupport } from "@strive/support/+state/support.firestore";

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    // const postsSnap = await db.collectionGroup('Posts').get()
    // const promises = []

    // for (const doc of postsSnap.docs) {
    //   const post = 
    // }

    // for (const doc of notificationsSnap.docs) {
    //   const notification = createNotification(doc.data())
    //   if (notification.source.milestone) {
    //     notification.source.milestone.content = notification.source.milestone['description']   
    //     const promise = db.doc(doc.ref.path).set(notification)
    //     promises.push(promise)
    //   }
    // }

    // for (const doc of supportsSnap.docs) {
    //   const support = createSupport(doc.data())
    //   if (support.milestone) {
    //     support.milestone.content = support.milestone['description']
    //     const promise = db.doc(doc.ref.path).set(support)
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