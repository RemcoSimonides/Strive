import { pipeline } from 'node:stream/promises'
import { admin, onRequest } from '@strive/api/firebase'

const CACHE_CONTROL = 'public, max-age=604800, s-maxage=2592000'

/**
 * Streams the MP4 that videoUploadedHandler made of a post video, with Range support so
 * browsers can seek and start playing early.
 * GET /video/goals/{goalId}/{mediaId}.mp4 (via the api hosting site, which caches it on its CDN)
 */
export const video = onRequest(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).send('Method not allowed')
    return
  }

  const path = decodeURIComponent(req.path).replace(/^\/(video\/)?/, '')
  if (path.includes('..') || !/^goals\/[^/]+\/[^/]+\.mp4$/.test(path)) {
    res.status(404).set('Cache-Control', 'public, max-age=60').send('Not found')
    return
  }

  const file = admin.storage().bucket().file(path)
  let size: number
  try {
    const [metadata] = await file.getMetadata()
    size = Number(metadata.size)
  } catch (err) {
    if ((err as { code?: number }).code !== 404) throw err
    // short cache: the conversion may still be running
    res.status(404).set('Cache-Control', 'public, max-age=60').send('Not found')
    return
  }

  res.set({ 'Content-Type': 'video/mp4', 'Accept-Ranges': 'bytes', 'Cache-Control': CACHE_CONTROL })
  const range = parseRange(req.get('range'), size)
  if (range === 'invalid') {
    res.status(416).set('Content-Range', `bytes */${size}`).end()
    return
  }

  const [start, end] = range ?? [0, size - 1]
  if (range) res.status(206).set('Content-Range', `bytes ${start}-${end}/${size}`)
  res.set('Content-Length', String(end - start + 1))
  if (req.method === 'HEAD') {
    res.end()
    return
  }
  await pipeline(file.createReadStream({ start, end }), res)
}, { region: 'europe-west1', memory: '512MiB', timeoutSeconds: 120, concurrency: 40 })

/** null when there is no (usable) Range header, 'invalid' when it cannot be satisfied */
function parseRange(header: string | undefined, size: number): [number, number] | null | 'invalid' {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header ?? '')
  if (!match || (!match[1] && !match[2])) return null
  const start = match[1] ? Number(match[1]) : Math.max(size - Number(match[2]), 0)
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1
  return start > end || start >= size ? 'invalid' : [start, end]
}
