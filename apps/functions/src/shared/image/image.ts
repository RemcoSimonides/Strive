export interface ImageParameters {
  /** automatic optimization : https://docs.imgix.com/apis/url/auto/auto */
  auto?: string
  /** resize behavior : https://docs.imgix.com/apis/url/size/fit */
  fit?: 'clamp' | 'clip' | 'crop' | 'facearea' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale'
  /** aspect ratio https://docs.imgix.com/apis/rendering/size/ar */
  ar?: string
  /** image width : https://docs.imgix.com/apis/url/size/w */
  w?: number
  /** image height : https://docs.imgix.com/apis/url/size/h */
  h?: number
  /** security token : https://github.com/imgix/imgix-blueprint#securing-urls */
  s?: string
  /** PDF page to display : https://docs.imgix.com/apis/rendering/pdf/page */
  page?: number
}

/**
 * Transform an `ImageParameters` object into the query string part of an url, ready to sent to imgix.
 * @example
 * const param: ImageParameters = {
 *   fit: 'crop',
 *   w: 100,
 *   h: 100
 * }
 * formatParameters(param) // 'fit=crop&w=100&h=100&'
 */
function formatParameters(parameters: ImageParameters): string {
  return Object.entries(parameters)
    .filter(([key, value]) => !!value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')
}

export function getImgIxResourceUrl(storagePath: string, parameters: ImageParameters) {
  const query = formatParameters(parameters)
  return `https://strive-journal.imgix.net/${encodeURI(storagePath)}?${query}`
}
