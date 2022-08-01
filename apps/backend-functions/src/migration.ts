import { functions } from "./internals/firebase";

export const migrate = functions.https.onRequest(async (req, res) => {

  try {
    // const notificationsSnap = await db.collectionGroup('Notifications').get()

    // const batch = db.batch()
    // logger.log('notifications: ', notificationsSnap.size)
    // for (const doc of notificationsSnap.docs) {
    //   const notification = createNotification(doc.data())
    //   const remove = [enumEvent.gFinished, enumEvent.gSupportPendingFailed, enumEvent.gSupportPendingSuccesful]

    //   if (remove.includes(notification.event)) {
    //     batch.delete(doc.ref)
    //   }
    // }
    // batch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})