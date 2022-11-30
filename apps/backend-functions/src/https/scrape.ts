import { functions } from '../internals/firebase'
import { logger } from 'firebase-functions'
import { ErrorResultResponse } from '../shared/utils'
import fetch from 'node-fetch'
import { wrapHttpsOnCallHandler } from '../internals/sentry'

/**
 * This function is accessible to anyone, go here to change it
 * https://console.cloud.google.com/functions
 */
export const scrapeMetatags = functions().https.onCall(wrapHttpsOnCallHandler('scrapeMetatags',
async (data: { url: string }): Promise<ErrorResultResponse> => {
  const { url } = data
  const { URLMETA_APIKEY, URLMETA_USERNAME } = process.env

  const base64Credentials = Buffer.from(`${URLMETA_USERNAME}:${URLMETA_APIKEY}`).toString('base64')
  const headers = { 'Authorization': base64Credentials }
  const get = `https://api.urlmeta.org/?url=${url}`
  const response = await fetch(get, { headers })

  if (!response.ok) {
    const error = await response.text()
    logger.error(error)
    return {
      error: `${response.status}`,
      result: error
    }
  }

  const json   = await response.json()
  const { result, meta } = json
  const { status } = result

  if (status !== 'OK') {
    logger.error(json)
    return {
      error: `${status}`,
      result: json
    }
  }

  return {
    error: '',
    result: meta
  }
}))