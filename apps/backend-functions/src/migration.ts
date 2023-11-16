import { functions, admin, RuntimeOptions } from '@strive/api/firebase'
import { BigBatch } from './shared/bigbatch'

const config: RuntimeOptions = {
  timeoutSeconds: 540,
  memory: '1GB',
}

export const migrate = functions(config).https.onRequest(async (req, res) => {

  try {
    const firestore = admin.firestore()
    const batch = new BigBatch({ firestore })

    await batch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})
