import type { Response } from 'express'
import sharp from 'sharp'
import { admin, logger, onRequest } from '@strive/api/firebase'

const ALLOWED_PREFIXES = ['goals/', 'profiles/']
// Fixed sizes, so nobody can make us render (and pay for) arbitrary variants
const ALLOWED_SIZES = [120, 240, 600, 1024, 1200, 2048]
const MAX_INPUT_BYTES = 25 * 1024 * 1024

type Format = 'avif' | 'webp' | 'jpeg'

/**
 * Serves images from Storage resized and in the best format the browser accepts.
 * GET /img/<storagePath>?w=120&h=120&fit=crop (via the api hosting site, which caches the result on its CDN)
 */
export const image = onRequest(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).send('Method not allowed')
    return
  }

  const path = decodeURIComponent(req.path).replace(/^\/(img\/)?/, '')
  if (path.includes('..') || !ALLOWED_PREFIXES.some(prefix => path.startsWith(prefix))) {
    return fail(res, 404, 'Not found')
  }

  const width = parseSize(req.query['w'])
  const height = parseSize(req.query['h'])
  if (width === null || height === null) return fail(res, 400, `w and h must be one of ${ALLOWED_SIZES.join(', ')}`)
  const fit = req.query['fit'] === 'crop' ? 'cover' : 'inside'

  const file = admin.storage().bucket().file(path)
  let buffer: Buffer
  try {
    const [metadata] = await file.getMetadata()
    if (Number(metadata.size) > MAX_INPUT_BYTES) return fail(res, 413, 'Image too large')
    ;[buffer] = await file.download()
  } catch (err) {
    if ((err as { code?: number }).code === 404) return fail(res, 404, 'Not found')
    throw err
  }

  const format = pickFormat(req.get('accept'))
  let output: Buffer
  try {
    // rotate() applies the EXIF orientation; output carries no metadata, so phone GPS data is stripped
    let pipeline = sharp(buffer, { failOn: 'none' }).rotate()
    if (width || height) pipeline = pipeline.resize({ width, height, fit, withoutEnlargement: true })
    output = await (
      format === 'avif' ? pipeline.avif({ quality: 50, effort: 4 }) :
      format === 'webp' ? pipeline.webp({ quality: 78 }) :
      pipeline.jpeg({ quality: 80, mozjpeg: true })
    ).toBuffer()
  } catch (err) {
    // e.g. videos or iPhone HEIC, which the prebuilt sharp cannot decode
    logger.warn(`Cannot render ${path}: ${(err as Error).message}`)
    return fail(res, 415, 'Unsupported image')
  }

  res.set({
    'Content-Type': `image/${format}`,
    'Cache-Control': 'public, max-age=604800, s-maxage=2592000',
    'Vary': 'Accept',
  })
  res.send(output)
}, { memory: '1GiB', timeoutSeconds: 60, concurrency: 10 })

/** undefined when not given, null when not an allowed size */
function parseSize(value: unknown): number | undefined | null {
  if (value === undefined || value === '') return undefined
  const size = Number(value)
  return ALLOWED_SIZES.includes(size) ? size : null
}

function pickFormat(accept = ''): Format {
  if (accept.includes('image/avif')) return 'avif'
  if (accept.includes('image/webp')) return 'webp'
  return 'jpeg'
}

function fail(res: Response, code: number, message: string) {
  // short cache, so an image that is uploaded a moment later still shows up
  res.status(code).set({ 'Cache-Control': 'public, max-age=60, s-maxage=60' }).send(message)
}
