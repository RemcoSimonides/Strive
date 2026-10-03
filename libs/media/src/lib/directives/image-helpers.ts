import { environment } from '@env'

/**
 * Options for the `image` function (apps/functions/src/https/image.ts).
 * The format (AVIF, WebP or JPEG) is picked by the function from the browser's Accept header.
 */
export interface ImageParameters {
  /** crop fills the exact w x h, without fit the image is scaled to fit inside w x h */
  fit?: 'crop'
  /** must be one of the sizes the function allows: 120, 240, 600, 1024, 1200, 2048 */
  w?: number
  h?: number
}

/** The next allowed size up for the 2x variant, if there is one */
const DOUBLE: Record<number, number> = { 120: 240, 600: 1200, 1024: 2048 }

function formatParameters(parameters: ImageParameters): string {
  return Object.entries(parameters)
    .filter(([, value]) => !!value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

/** URL of a Storage image, resized and converted by the image function */
export function getImageUrl(storagePath: string, parameters: ImageParameters = {}) {
  const query = formatParameters(parameters)
  return `${environment.images.baseUrl}/${encodeURI(storagePath)}${query ? `?${query}` : ''}`
}

/** srcset with a 2x variant for high density screens, when the doubled size is allowed */
export function getImageSrcset(storagePath: string, parameters: ImageParameters = {}) {
  const src = getImageUrl(storagePath, parameters)
  const { w, h } = parameters
  const w2 = w ? DOUBLE[w] : undefined
  const h2 = h ? DOUBLE[h] : undefined
  if ((w && !w2) || (h && !h2) || (!w && !h)) return src
  return `${src} 1x, ${getImageUrl(storagePath, { ...parameters, w: w2, h: h2 })} 2x`
}
