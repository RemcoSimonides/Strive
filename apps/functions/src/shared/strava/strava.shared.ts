import { logger } from "@strive/api/firebase"
import { ActivityResponse, AthleteResponse } from "@strive/model"
import fetch from 'node-fetch'

export async function fetchToken(code: string): Promise<{ access_token: string, refresh_token: string, athlete: AthleteResponse}> {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = process.env
  const url = `https://www.strava.com/api/v3/oauth/token?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}&code=${code}&grant_type=authorization_code`
  const options = {
    method: 'POST'
  }

  return _fetch<{ access_token: string, refresh_token: string, athlete: AthleteResponse }>(url, options)
}

export async function fetchRefreshToken(refresh_token: string): Promise<{ access_token: string, refresh_token: string}> {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET } = process.env
  const url = `https://www.strava.com/api/v3/oauth/token?client_id=${STRAVA_CLIENT_ID}&client_secret=${STRAVA_CLIENT_SECRET}&refresh_token=${refresh_token}&grant_type=refresh_token`
  const options = {
    method: 'POST'
  }

  return _fetch<{ access_token: string, refresh_token: string }>(url, options)
}

export function fetchActivities(access_token: string, after: number ): Promise<ActivityResponse[]> {
  // TODO add page and per_page parameters (https://developers.strava.com/docs/reference/#api-Activities-getLoggedInAthleteActivities)
  const url = `https://www.strava.com/api/v3/athlete/activities?after=${after}&per_page=200`
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }

  return _fetch<ActivityResponse[]>(url, options)
}

export function fetchActivity(access_token: string, activityId: number): Promise<ActivityResponse> {
  const url = `https://www.strava.com/api/v3/activities/${activityId}`
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }

  return _fetch<ActivityResponse>(url, options)
}

export function fetchAthlete(access_token: string): Promise<AthleteResponse> {
  const url = `https://www.strava.com/api/v3/athlete`
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${access_token}`
    }
  }

  return _fetch<AthleteResponse>(url, options)
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