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

    // Migrate posts: stravaActivityId → externalId + source
    // Query per-goal instead of collectionGroup to avoid index requirements
    const goalsSnap = await firestore.collection('Goals').get()
    for (const goalDoc of goalsSnap.docs) {
      const postsSnap = await goalDoc.ref.collection('Posts')
        .where('stravaActivityId', '>', 0)
        .get()

      for (const doc of postsSnap.docs) {
        const data = doc.data()
        batch.update(doc.ref, {
          externalId: `${data.stravaActivityId}`,
          source: 'strava',
          stravaActivityId: admin.firestore.FieldValue.delete()
        })
      }
    }
    console.log('Posts migration prepared')

    // Migrate Personal: stravaRefreshToken → oauthTokens.strava
    const usersSnap = await firestore.collection('Users').get()
    for (const userDoc of usersSnap.docs) {
      const personalSnap = await userDoc.ref.collection('Personal').get()
      for (const doc of personalSnap.docs) {
        const data = doc.data()
        if (data.stravaRefreshToken) {
          batch.update(doc.ref, {
            'oauthTokens.strava': data.stravaRefreshToken,
            stravaRefreshToken: admin.firestore.FieldValue.delete()
          })
        }
      }
    }
    console.log('Personal migration prepared')

    // Migrate Strava: encryptedApiKey → Personal doc's encryptedApiKeys map
    const stravaSnap = await firestore.collection('Strava').get()
    for (const doc of stravaSnap.docs) {
      const data = doc.data()
      if (data.userId && data.apiKeyId && data.encryptedApiKey) {
        batch.update(firestore.doc(`Users/${data.userId}/Personal/${data.userId}`), {
          [`encryptedApiKeys.${data.apiKeyId}`]: data.encryptedApiKey
        })
        batch.update(doc.ref, {
          encryptedApiKey: admin.firestore.FieldValue.delete()
        })
      }
    }
    console.log('Strava migration prepared')

    await batch.commit()
    console.log('Migration committed')

    res.status(200).send('all good')
  } catch (err) {
    console.error('Migration failed:', err)
    res.status(400).send(`Oh no! ABORT! ${err.message || err}`)
  }
}, config)
