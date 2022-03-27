import { functions } from '../internals/firebase';
import { logger } from 'firebase-functions';
import { ErrorResultResponse } from '../shared/utils';
import fetch from 'node-fetch';
import { urlmetaUsername, urlmetaApiKey } from '../environments/environment';

/**
 * This function is accessible to anyone, go here to change it
 * https://console.cloud.google.com/functions
 */
export const scrapeMetatags = functions.https.onCall(async (data: { url: string }): Promise<ErrorResultResponse> => {
  const { url } = data

  const base64Credentials = Buffer.from(`${urlmetaUsername}:${urlmetaApiKey}`).toString('base64')
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

  const result = await response.json() 
  return {
    error: '',
    result
  }
})