import { environment } from '@env';

/**
 * Interface that hold the image options for imgix processing.
 * @note the key names has to be exactly the same as in the imgix api !
 */
export interface ImageParameters {
  /** automatic optimization : https://docs.imgix.com/apis/url/auto/auto */
  auto?: string;
  /** resize behavior : https://docs.imgix.com/apis/url/size/fit */
  fit?: 'clamp' | 'clip' | 'crop' | 'facearea' | 'fill' | 'fillmax' | 'max' | 'min' | 'scale';
  /** aspect ratio https://docs.imgix.com/apis/rendering/size/ar */
  ar?: string;
  /** image width : https://docs.imgix.com/apis/url/size/w */
  w?: number;
  /** image height : https://docs.imgix.com/apis/url/size/h */
  h?: number;
  /** security token : https://github.com/imgix/imgix-blueprint#securing-urls */
  s?: string;
  /** PDF page to display : https://docs.imgix.com/apis/rendering/pdf/page */
  page?: number;
}

export function getImgSize(ref?: string) {
  if (ref?.includes('avatar')) {
    return [50, 100, 300];
  } else if (ref?.includes('logo')) {
    return [50, 100, 300];
  } else if (ref?.includes('poster')) {
    return [200, 400, 600];
  } else if (ref?.includes('banner')) {
    return [300, 600, 1200];
  } else if (ref?.includes('still')) {
    return [300, 600, 1200];
  } else {
    return [1024];
  }
}

/**
 * Transform an `ImageParameters` object into the query string part of an url, ready to sent to imgix.
 * @example
 * const param: ImageParameters = {
 *   fit: 'crop',
 *   w: 100,
 *   h: 100
 * };
 * formatParameters(param); // 'fit=crop&w=100&h=100&'
 */
export function formatParameters(parameters: ImageParameters): string {
  const query = Object.entries(parameters)
    .filter(([key, value]) => !!value)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
  return query;
}

/**
 * getImgIxResourceUrl : Generate ImgIx resource URL
 * @param storagePath
 * @param parameters
 */
export function getImgIxResourceUrl(storagePath: string, parameters: ImageParameters) {
  const query = formatParameters(parameters);
  return `https://${environment.firebase.projectId}.imgix.net/${encodeURI(storagePath)}?${query}`;
}
