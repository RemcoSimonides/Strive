import { createUser } from '@strive/model';
import { db, functions, logger } from './internals/firebase';
import { toDate } from './shared/utils';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {
    // const usersSnap = await db.collection('Users').get()
    // const index = getAlgoliaIndex('user')

    // const users = []

    // for (const doc of usersSnap.docs) {
    //   const user = createUser(toDate({ ...doc.data(), id: doc.id }))
      
    //   users.push({
    //     objectID: doc.id,
    //     username: user.username,
    //     photoURL: user.photoURL,
    //     numberOfSpectators: user.numberOfSpectators
    //   })
    // }

    // const batchRequest = users.map(user => ({ action: 'updateObject', body: user }))


    // logger.log('batch request: ', batchRequest)
    // index.batch(batchRequest as any)

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})