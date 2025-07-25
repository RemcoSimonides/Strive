import { db, logger, onCall, onRequest } from '@strive/api/firebase'
import { ErrorResultResponse, toDate } from '../shared/utils'
import { ActivityType, createStravaIntegration } from '@strive/model'
import { createPersonal, createPost } from '@strive/model'
import { fetchActivities, fetchActivity, fetchAthlete, fetchRefreshToken, fetchToken } from '../shared/strava/strava.shared'

// https://developers.strava.com/docs/webhooks/
interface StravaEvent {
  aspect_type: 'create' | 'update' | 'delete'
  event_time: number
  object_id: number // For activity events, the activityId. For athlete events, the athleteId
  object_type: 'activity' | 'athlete'
  owner_id: number // athleteId
  subscription_id: number
  updates: unknown
}

export const listenToStrava = onRequest(async (req, res) => {
  const challenge = req.query['hub.challenge']

  if (challenge) {
    res.setHeader('Content-Type', 'application/json')
    res.send({ 'hub.challenge': challenge })
    return
  }

  res.sendStatus(200)

  const body: StravaEvent = req.body
  logger.log('Request body', body)
  if (body.object_type !== 'activity') {
    logger.log('Not an activity event')
    return
  }

  if (body.aspect_type !== 'create') {
    logger.log('Not a create event')
    return
  }

  const stravaSnap = await db.collection('Strava').where('athleteId', '==', body.owner_id).where('enabled', '==', true).get()

  if (!stravaSnap.size) {
    logger.log('No enabled strava integrations found for athlete', body.owner_id)
  }

  for (const doc of stravaSnap.docs) {
    const strava = createStravaIntegration(toDate({ ...doc.data(), id: doc.id }))
    logger.log('strava integration found', strava)
    const { userId, goalId, activityTypes } = strava

    const personalSnap = await db.doc(`Users/${userId}/Personal/${userId}`).get()
    const personal = createPersonal(toDate({ ...personalSnap.data(), id: personalSnap.id }))
    if (!personal.stravaRefreshToken) {
      logger.error('No strava refresh token for person', userId)
      continue
    }

    const { access_token, refresh_token } = await fetchRefreshToken(personal.stravaRefreshToken)
    // save refresh token
    personalSnap.ref.update({ stravaRefreshToken: refresh_token })

    // fetch activity
    const activity = await fetchActivity(access_token, body.object_id)

    // check if activity type is in this goal
    if (!activityTypes.includes(activity.type)) {
      continue
    }

    // create post
    const post = createPost({
      uid: userId,
      goalId,
      description: activity.name,
      date: new Date(activity.start_date),
      url: `https://www.strava.com/activities/${activity.id}`,
      stravaActivityId: activity.id
    })
    db.collection(`Goals/${goalId}/Posts`).add(post)

    // update totals
    const updatedStravaIntegration = createStravaIntegration({
      totalActivities: strava.totalActivities + 1,
      totalDistance: strava.totalDistance + activity.distance,
      totalMovingTime: strava.totalMovingTime + activity.moving_time,
      totalElevationGain: strava.totalElevationGain + activity.total_elevation_gain,
      updatedAt: new Date(),
    })
    doc.ref.update({ ...updatedStravaIntegration })
  }
})

/**
 * This function is accessible to anyone, go here to change it
 * https://console.cloud.google.com/functions
 */
export const initialiseStrava = onCall(
async (request): Promise<ErrorResultResponse> => {

  const data: { authorizationCode: string, refreshToken: string, goalId: string, activityTypes: ActivityType[], after: number | undefined } = request.data

  logger.log('parameters: ', data)

  const userId = request.auth.uid
  if (!userId) {
    return {
      error: 'Unauthorized',
      result: 'Unauthorized'
    }
  }

  const { authorizationCode, refreshToken, goalId, activityTypes, after } = data
  if ((!authorizationCode && !refreshToken) || !goalId || !activityTypes) {
    return {
      error: 'Missing parameters',
      result: 'Missing parameters'
    }
  }

  try {
    let athleteId = ''
    let newRefreshToken = ''
    let accessToken = ''
    if (authorizationCode) {
      const { access_token, refresh_token, athlete } = await fetchToken(authorizationCode)
      athleteId = `${athlete.id}`
      newRefreshToken = refresh_token
      accessToken = access_token
    } else {
      const { access_token, refresh_token } = await fetchRefreshToken(refreshToken)
      newRefreshToken = refresh_token
      accessToken = access_token

      const { id } = await fetchAthlete(access_token)
      athleteId = `${id}`
    }

    const personalRef = db.doc(`Users/${userId}/Personal/${userId}`)
    await personalRef.update({ stravaRefreshToken: newRefreshToken })

    if (after) {
      const activities = await fetchActivities(accessToken, after)

      // filter out activities based on activityType
      const filtered = activities.filter(activity => activityTypes.includes(activity.type))

      const totalActivities = filtered.length
      const totalDistance = filtered.reduce((total, activity) => total + activity.distance, 0)
      const totalMovingTime = filtered.reduce((total, activity) => total + activity.moving_time, 0)
      const totalElevationGain = filtered.reduce((total, activity) => total + activity.total_elevation_gain, 0)

      const stravaIntegration = createStravaIntegration({
        athleteId,
        userId,
        goalId,
        activityTypes,
        totalActivities,
        totalDistance,
        totalMovingTime,
        totalElevationGain
      })

      db.collection(`Strava`).add(stravaIntegration)

      const batch = db.batch()
      for (const activity of filtered) {
        const post = createPost({
          uid: userId,
          goalId,
          description: activity.name,
          date: new Date(activity.start_date),
          url: `https://www.strava.com/activities/${activity.id}`,
          stravaActivityId: activity.id
        })
        const postRef = db.collection(`Goals/${goalId}/Posts`).doc()
        batch.set(postRef, post)
      }
      batch.commit()
    } else {
      const stravaIntegration = createStravaIntegration({
        athleteId,
        userId,
        goalId,
        activityTypes
      })
      db.doc(`Strava/${goalId}${userId}`).set(stravaIntegration)
    }

    return {
      error: '',
      result: 'ok'
    }

  } catch (err) {
    logger.error(err)
    return {
      error: err.message,
      result: null
    }
  }

})

