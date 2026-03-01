import { db, onDocumentUpdate, logger } from '@strive/api/firebase'

export const stravaIntegrationChangeHandler = onDocumentUpdate('Strava/{stravaId}', async (snapshot) => {
  const before = snapshot.data.before.data()
  const after = snapshot.data.after.data()

  // When integration is disabled, revoke the associated API key
  if (before.enabled && !after.enabled && after.apiKeyId) {
    logger.log(`Strava integration ${snapshot.params.stravaId} disabled — revoking API key ${after.apiKeyId}`)
    await db.doc(`ApiKeys/${after.apiKeyId}`).update({ revoked: true, updatedAt: new Date() })
  }
})
