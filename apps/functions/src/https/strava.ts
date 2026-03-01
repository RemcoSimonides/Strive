import { db, logger, onCall, onRequest } from '@strive/api/firebase'
import { ErrorResultResponse, toDate } from '../shared/utils'
import { ActivityType, createApiKey, createStravaIntegration } from '@strive/model'
import { createPersonal } from '@strive/model'
import { fetchActivities, fetchActivity, fetchAthlete, fetchRefreshToken, fetchToken } from '../shared/strava/strava.shared'
import { generateApiKey } from '../shared/api-key'
import { encrypt, decrypt } from '../shared/encryption'
import { createStriveApiClient } from '../shared/strive-api/strive-api.client'

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
    const verifyToken = req.query['hub.verify_token']
    const expectedToken = process.env['STRAVA_WEBHOOK_VERIFY_TOKEN']
    if (!expectedToken || verifyToken !== expectedToken) {
      res.status(403).json({ error: 'Invalid verify token' })
      return
    }

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
    const stravaToken = personal.oauthTokens['strava']
    if (!stravaToken) {
      logger.error('No strava OAuth token for person', userId)
      continue
    }

    const { access_token, refresh_token } = await fetchRefreshToken(stravaToken)
    // save refresh token
    personalSnap.ref.update({ 'oauthTokens.strava': refresh_token })

    // fetch activity
    const activity = await fetchActivity(access_token, body.object_id)

    // check if activity type is in this goal
    if (!activityTypes.includes(activity.type)) {
      continue
    }

    // create post via API
    try {
      const encryptionSecret = process.env['API_KEY_ENCRYPTION_SECRET']
      const encryptedKey = personal.encryptedApiKeys[strava.apiKeyId]
      if (!encryptedKey || !encryptionSecret) {
        logger.error('Missing API key or encryption secret for Strava integration', doc.id)
        continue
      }

      const apiKey = decrypt(encryptedKey, encryptionSecret)
      const client = createStriveApiClient(apiKey)

      const { status } = await client.createPost(goalId, {
        description: activity.name,
        date: new Date(activity.start_date).toISOString(),
        url: `https://www.strava.com/activities/${activity.id}`,
        externalId: `${activity.id}`,
        source: 'strava'
      })

      // 200 means duplicate (already exists) — skip totals update
      if (status === 200) {
        logger.log('Post already exists for activity', activity.id)
        continue
      }
    } catch (err) {
      const error = err as Error & { status?: number }
      if (error.status === 401) {
        logger.error('API key revoked for Strava integration', doc.id, '— disabling integration')
        await doc.ref.update({ enabled: false, updatedAt: new Date() })
      } else {
        logger.error('Failed to create post via API for Strava integration', doc.id, error.message)
      }
      continue
    }

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

    // Auto-create API key for Strava integration
    const { rawKey, hashedKey, prefix } = generateApiKey()
    const now = new Date()
    const apiKeyData = createApiKey({
      uid: userId,
      name: 'Strava Integration',
      prefix,
      hashedKey,
      scopes: ['posts:write'],
      createdAt: now,
      updatedAt: now,
    })
    const { id: _keyId, ...keyDataWithoutId } = apiKeyData
    const apiKeyRef = await db.collection('ApiKeys').add(keyDataWithoutId)
    logger.log(`API key created for Strava integration: ${apiKeyRef.id} (${prefix}...)`)

    // Encrypt the raw key and store in Personal doc alongside OAuth token
    const encryptionSecret = process.env['API_KEY_ENCRYPTION_SECRET']
    const personalRef = db.doc(`Users/${userId}/Personal/${userId}`)
    await personalRef.update({
      'oauthTokens.strava': newRefreshToken,
      ...(encryptionSecret ? { [`encryptedApiKeys.${apiKeyRef.id}`]: encrypt(rawKey, encryptionSecret) } : {})
    })

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
        totalElevationGain,
        apiKeyId: apiKeyRef.id
      })

      db.collection(`Strava`).add(stravaIntegration)

      // Create posts via API
      const client = createStriveApiClient(rawKey)
      for (const activity of filtered) {
        try {
          await client.createPost(goalId, {
            description: activity.name,
            date: new Date(activity.start_date).toISOString(),
            url: `https://www.strava.com/activities/${activity.id}`,
            externalId: `${activity.id}`,
            source: 'strava'
          })
        } catch (err) {
          logger.error('Failed to create post via API for activity', activity.id, (err as Error).message)
        }
      }
    } else {
      const stravaIntegration = createStravaIntegration({
        athleteId,
        userId,
        goalId,
        activityTypes,
        apiKeyId: apiKeyRef.id
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
