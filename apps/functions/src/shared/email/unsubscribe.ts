import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Unsubscribe links carry the uid and an HMAC of it, so a link only works for the user it was sent to.
 * Never use Personal.key here: that is the user's encryption key.
 */
function sign(uid: string) {
  const secret = process.env['EMAIL_UNSUBSCRIBE_SECRET']
  if (!secret) throw new Error('email unsubscribe secret missing')
  return createHmac('sha256', secret).update(`unsubscribe:${uid}`).digest('base64url')
}

export function unsubscribeUrl(uid: string) {
  const project = process.env['GCLOUD_PROJECT']
  return `https://us-central1-${project}.cloudfunctions.net/emailUnsubscribe?uid=${encodeURIComponent(uid)}&token=${sign(uid)}`
}

export function isValidUnsubscribeToken(uid: string, token: string) {
  if (!uid || !token) return false
  const expected = Buffer.from(sign(uid))
  const given = Buffer.from(token)
  return expected.length === given.length && timingSafeEqual(expected, given)
}
