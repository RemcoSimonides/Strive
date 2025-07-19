import { admin, onRequest } from '@strive/api/firebase'
import { BigBatch } from './shared/bigbatch'
import { GlobalOptions } from 'firebase-functions/v2'

const config: GlobalOptions = {
  timeoutSeconds: 540,
  memory: '1GiB',
}

export const migrate = onRequest(async (req, res) => {

  try {
    const firestore = admin.firestore()
    const batch = new BigBatch({ firestore })

    await batch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
}, config)
