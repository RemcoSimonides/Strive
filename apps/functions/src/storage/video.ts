import { onObjectFinalized } from 'firebase-functions/v2/storage'
import { admin, db, logger } from '@strive/api/firebase'
import { transcodeVideo } from '../shared/video/transcode'

/**
 * A post video is uploaded to goals/{goalId}/{mediaId} with the mediaId in its custom metadata
 * (MediaService.upload). Convert it to a playable MP4 + poster and mark the Media doc uploaded.
 * Runs in europe-west1 because a Storage trigger has to be near the bucket, which is in the EU.
 */
export const videoUploadedHandler = onObjectFinalized({ region: 'europe-west1', memory: '2GiB', cpu: 2, timeoutSeconds: 300 }, async (event) => {
  const { name, bucket, contentType, metadata } = event.data
  const [prefix, goalId, mediaId, ...rest] = name.split('/')
  if (prefix !== 'goals' || rest.length || !contentType?.startsWith('video/') || metadata?.['mediaId'] !== mediaId) return

  const mediaRef = db.doc(`Goals/${goalId}/Media/${mediaId}`)
  try {
    await transcodeVideo(admin.storage().bucket(bucket), name)
    await mediaRef.update({ status: 'uploaded', updatedAt: new Date() })
  } catch (err) {
    logger.error(`Video ${name} could not be converted`, err)
    // the Media doc may already be gone when the post was deleted during the upload
    await mediaRef.update({ status: 'error', updatedAt: new Date() }).catch(() => undefined)
  }
})
