import { gcsBucket, logger, onCall } from '@strive/api/firebase'
import { HttpsError } from 'firebase-functions/v2/https'
import { ErrorResultResponse } from '../shared/utils'
import fetch from 'node-fetch'

export const scrapeMetatags = onCall(async (request): Promise<ErrorResultResponse> => {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Authentication required')

  const data: { url: string } = request.data
  const { url } = data
  if (!isSafePublicHttpUrl(url)) throw new HttpsError('invalid-argument', 'Not a valid public URL')

  const { URLMETA_APIKEY, URLMETA_USERNAME } = process.env

  const base64Credentials = Buffer.from(`${URLMETA_USERNAME}:${URLMETA_APIKEY}`).toString('base64')
  const headers = { 'Authorization': base64Credentials }
  const get = `https://api.urlmeta.org/?url=${encodeURIComponent(url)}`
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

export const downloadImageFromURL = onCall(async (request): Promise<ErrorResultResponse> => {
  if (!request.auth?.uid) throw new HttpsError('unauthenticated', 'Authentication required')

  const { url, storagePath }: { url: string, storagePath: string } = request.data
  if (!isSafePublicHttpUrl(url)) return {
    error: 'Not a valid public URL',
    result: ''
  }
  if (!isAllowedStoragePath(storagePath)) return {
    error: 'Invalid storage path',
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

/**
 * Validates that a URL is a public http(s) resource, blocking SSRF vectors:
 * non-http schemes, localhost, and private/reserved/link-local IP ranges
 * (incl. the cloud metadata endpoint 169.254.169.254).
 */
function isSafePublicHttpUrl(str: string): boolean {
  let parsed: URL
  try {
    parsed = new URL(str)
  } catch {
    return false
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return false

  const host = parsed.hostname.toLowerCase()
  if (host === 'localhost' || host.endsWith('.localhost') || host === 'metadata.google.internal') return false
  if (host === '0.0.0.0' || host === '::1' || host === '[::1]') return false

  // Block IPv4 literals in private / loopback / link-local / reserved ranges
  const ipv4 = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (ipv4) {
    const [a, b] = [parseInt(ipv4[1], 10), parseInt(ipv4[2], 10)]
    if (a === 10) return false
    if (a === 127) return false
    if (a === 0) return false
    if (a === 169 && b === 254) return false // link-local incl. metadata
    if (a === 172 && b >= 16 && b <= 31) return false
    if (a === 192 && b === 168) return false
    if (a >= 224) return false // multicast / reserved
  }

  // Block obvious IPv6 private/loopback literals
  if (host.startsWith('[') && (host.includes('fc') || host.includes('fd') || host.includes('fe80'))) return false

  return true
}

/** Restricts uploads to the app's own media prefixes and blocks path traversal. */
function isAllowedStoragePath(path: string): boolean {
  if (typeof path !== 'string' || !path) return false
  if (path.includes('..')) return false
  return path.startsWith('goals/') || path.startsWith('profiles/')
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