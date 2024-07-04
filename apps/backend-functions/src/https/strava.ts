import { db, functions, logger } from '@strive/api/firebase'
import { ErrorResultResponse, toDate } from '../shared/utils'
import { wrapHttpsOnCallHandler, wrapHttpsOnRequestHandler } from '@strive/api/sentry'
import fetch from 'node-fetch'
import { ActivityResponse, ActivityType, createStravaIntegration } from 'libs/model/src/lib/strava'
import { Personal, createPersonal, createPost } from '@strive/model'

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

export const listenToStrava = functions().https.onRequest(wrapHttpsOnRequestHandler('listenToStrava', async (req, res) => {
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
    return
  }

  if (body.aspect_type !== 'create') {
    return
  }

  const stravaSnap = await db.collection('Strava').where('athleteId', '==', body.owner_id).where('enabled', '==', true).get()
  for (const doc of stravaSnap.docs) {
    const strava = createStravaIntegration(toDate({ ...doc.data(), id: doc.id }))
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

  res.sendStatus(200)
}))

/**
 * This function is accessible to anyone, go here to change it
 * https://console.cloud.google.com/functions
 */
export const initialiseStrava = functions().https.onCall(wrapHttpsOnCallHandler('initialiseStrava',
async (data: { authorizationCode: string, refreshToken: string, goalId: string, activityTypes: ActivityType[], after: number | undefined }, context): Promise<ErrorResultResponse> => {

  logger.log('parameters: ', data)

  const userId = context.auth?.uid
  if (!userId) {
    return {
      error: 'Unauthorized',
      result: null
    }
  }

  const { authorizationCode, refreshToken, goalId, activityTypes, after } = data
  if ((!authorizationCode && !refreshToken) || !goalId || !activityTypes) {
    return {
      error: 'Missing parameters',
      result: null
    }
  }

  try {
    let athleteId = ''
    let newRefreshToken = ''
    let accessToken = ''
    if (authorizationCode) {
      const { access_token, refresh_token, athlete } = await fetchToken(authorizationCode)
      athleteId = athlete.id
      newRefreshToken = refresh_token
      accessToken = access_token
    } else {
      const { access_token, refresh_token } = await fetchRefreshToken(refreshToken)
      newRefreshToken = refresh_token
      accessToken = access_token
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

}))

async function fetchToken(code: string): Promise<{ access_token: string, refresh_token: string, athlete: { id: string }}> {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = process.env
  const url = `https://www.strava.com/api/v3/oauth/token?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}&code=${code}&grant_type=authorization_code`
  const options = {
    method: 'POST'
  }

  return _fetch<{ access_token: string, refresh_token: string, athlete: { id: string} }>(url, options)
}

async function fetchRefreshToken(refresh_token: string): Promise<{ access_token: string, refresh_token: string}> {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = process.env
  const url = `https://www.strava.com/api/v3/oauth/token?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}&refresh_token=${refresh_token}&grant_type=refresh_token`
  const options = {
    method: 'POST'
  }

  return _fetch<{ access_token: string, refresh_token: string }>(url, options)
}

function fetchActivities(access_token: string, after: number ): Promise<ActivityResponse[]> {
  const url = `https://www.strava.com/api/v3/athlete/activities?after=${after}`
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }

  return _fetch<ActivityResponse[]>(url, options)
}

function fetchActivity(access_token: string, activityId: number): Promise<ActivityResponse> {
  const url = `https://www.strava.com/api/v3/activities/${activityId}`
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }

  return _fetch<ActivityResponse>(url, options)
}

async function _fetch<T>(url: fetch.RequestInfo, options: fetch.RequestInit): Promise<T> {
  logger.log('fetching from url: ', url)
  logger.log('with options: ', options)
  const response = await fetch(url, options)
  if (!response.ok) {
    const error = await response.text()
    throw new Error(error)
  }
  const result = await response.json()
  logger.log('response: ', result)
  return result
  // return await response.json()
}