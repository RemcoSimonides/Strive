import { onRequest } from '@strive/api/firebase'
import { GlobalOptions } from 'firebase-functions/v2'

const config: GlobalOptions = {
  timeoutSeconds: 540,
  memory: '1GiB',
}

export const migrate = onRequest(async (req, res) => {

  try {
    res.status(200).send('all good')
  } catch (err) {
    console.error('Migration failed:', err)
    res.status(400).send(`Oh no! ABORT! ${err.message || err}`)
  }
}, config)
