import { gcsBucket, logger, onCall } from '@strive/api/firebase'
import { ErrorResultResponse } from '../shared/utils'
import fetch from 'node-fetch'

/**
 * This function is accessible to anyone, go here to change it
 * https://console.cloud.google.com/functions
 */
export const scrapeMetatags = onCall(async (request): Promise<ErrorResultResponse> => {
  const data: { url: string } = request.data
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
})

export const downloadImageFromURL = onCall(async (data: { url: string, storagePath: string }): Promise<ErrorResultResponse> => {
  const { url, storagePath } = data
  if (!validURL(url)) return {
    error: 'Not a valid URL',
    result: ''
  }

  try {
    await uploadFileFromUrl(url, `${storagePath}`)
  } catch (error) {
    return {
      error,
      result: ''
    }
  }

  return {
    error: '',
    result: 'ok'
  }
})

function validURL(str: string) {
  const pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}

async function uploadFileFromUrl(fileUrl: string, storagePath: string) {
  return new Promise((resolve, reject) => {

    fetch(fileUrl).then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch file from URL');
      }

      const contentType = response.headers.get('Content-Type');

      response.arrayBuffer().then(buffer => {
        const data = Buffer.from(buffer);
        const file = gcsBucket.file(storagePath);
        const writeStream = file.createWriteStream({ metadata: { contentType }});

        writeStream.write(data)
        writeStream.end()

        writeStream.on('finish', () => {
          resolve(undefined)
        });

        writeStream.on('error', (error) => {
          reject(error)
        });
      })
    })
  })
}