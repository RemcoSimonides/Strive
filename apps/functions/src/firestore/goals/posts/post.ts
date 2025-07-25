import { db, logger, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'
import { toDate } from '../../../shared/utils'
import { createGoalSource, createPersonal, createPost, createStravaIntegration, Post } from '@strive/model'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'
import { isEqual } from 'date-fns'
import { fetchActivity, fetchRefreshToken } from '../../../shared/strava/strava.shared'

export const postCreatedHandler = onDocumentCreate(`Goals/{goalId}/Posts/{postId}`,
async (snapshot) => {

  const { postId } = snapshot.params
  const post = createPost(toDate({ ...snapshot.data.data(), id: postId }))

  const source = createGoalSource({
    goalId: post.goalId,
    userId: post.uid,
    milestoneId: post.milestoneId,
    postId
  })
  addGoalEvent('goalStoryPostCreated', source, postId)
  addStoryItem('goalStoryPostCreated', source, postId, post.date)
})

export const postChangeHandler = onDocumentUpdate(`Goals/{goalId}/Posts/{postId}`,
async (snapshot) => {

  const { goalId, postId } = snapshot.params
  const before = createPost(toDate({ ...snapshot.data.before.data(), id: postId }))
  const after = createPost(toDate({ ...snapshot.data.after.data(), id: postId }))

  if (!isEqual(before.date, after.date)) {
    db.doc(`Goals/${goalId}/Story/${after.id}`).update({ date: after.date })
  }
})

export const postDeletedHandler = onDocumentDelete(`Goals/{goalId}/Posts/{postId}`,
async (snapshot) => {
  const { goalId, postId } = snapshot.params
  const post = createPost(toDate({ ...snapshot.data.data(), id: postId }))

  const mediaRefs = post.mediaIds.map(mediaId => `Goals/${goalId}/Media/${mediaId}`)
  const batch = db.batch()

  _removeStravaActivityFromTotal(post)

  for (const ref of mediaRefs) {
    batch.delete(db.doc(ref))
  }

  await batch.commit()

  db.doc(`Goals/${goalId}/Story/${postId}`).delete()
})

async function _removeStravaActivityFromTotal(post: Post) {
  if (!post.stravaActivityId) return

  const personalSnap = await db.doc(`Users/${post.uid}/Personal/${post.uid}`).get()
  const personal = createPersonal(toDate({ ...personalSnap.data(), id: personalSnap.id}))
  if (!personal.stravaRefreshToken) {
    logger.log('No strava refresh token for person', post.uid)
    return
  }

  const { access_token, refresh_token } = await fetchRefreshToken(personal.stravaRefreshToken)
  // save refresh token
  personalSnap.ref.update({ stravaRefreshToken: refresh_token })

  // fetch activity
  const activity = await fetchActivity(access_token, post.stravaActivityId);

  const stravaSnap = await db.collection('Strava').where('goalId', '==', post.goalId).where('athleteId', '==', activity.athlete.id).get()
  if (!stravaSnap.size) {
    logger.log(`No Strava integration found for goal ${post.goalId} and athlete ${activity.athlete.id}`)
    return
  }

  for (const doc of stravaSnap.docs) {
    // substract activity from the total count
    const stravaIntegration = createStravaIntegration(toDate({ ...doc.data(), id: doc.id }))
    const updatedStravaIntegration = createStravaIntegration({
      ...stravaIntegration,
      totalActivities: stravaIntegration.totalActivities - 1,
      totalDistance: stravaIntegration.totalDistance - activity.distance,
      totalMovingTime: stravaIntegration.totalMovingTime - activity.moving_time,
      totalElevationGain: stravaIntegration.totalElevationGain - activity.total_elevation_gain
    })
    await doc.ref.update({ ...updatedStravaIntegration })
  }
}