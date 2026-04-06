import { Request, Response, NextFunction } from 'express'
import { db } from '@strive/api/firebase'
import { ApiKey, ApiKeyScope, createApiKey } from '@strive/model'
import { toDate } from '../utils'
import { hashApiKey } from './api-key.utils'
import { createHash } from 'crypto'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      apiKey?: ApiKey
    }
  }
}

/**
 * Authenticate via API key (sk_live_ prefix) or OAuth access token.
 * On success, populates req.apiKey with user identity and scopes.
 */
export async function authenticateApiKey(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header. Use: Bearer <token>' })
    return
  }

  const token = authHeader.slice(7)

  // --- API key path ---
  if (token.startsWith('sk_live_')) {
    const hashedKey = hashApiKey(token)

    const snapshot = await db.collection('ApiKeys')
      .where('hashedKey', '==', hashedKey)
      .where('revoked', '==', false)
      .limit(1)
      .get()

    if (snapshot.empty) {
      res.status(401).json({ error: 'Invalid or revoked API key' })
      return
    }

    const doc = snapshot.docs[0]
    const apiKey = createApiKey(toDate({ ...doc.data(), id: doc.id }))

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      res.status(401).json({ error: 'API key has expired' })
      return
    }

    req.apiKey = apiKey

    // Update lastUsedAt fire-and-forget
    doc.ref.update({ lastUsedAt: new Date() }).catch(() => undefined)

    next()
    return
  }

  // --- OAuth token path ---
  const hashedToken = createHash('sha256').update(token).digest('hex')

  const snap = await db.collection('OAuthTokens')
    .where('accessTokenHash', '==', hashedToken)
    .limit(1)
    .get()

  if (snap.empty) {
    res.status(401).json({ error: 'Invalid token' })
    return
  }

  const tokenData = snap.docs[0].data()
  const now = Math.floor(Date.now() / 1000)

  if (now > tokenData.accessTokenExpiresAt) {
    res.status(401).json({ error: 'Access token has expired' })
    return
  }

  // Create a virtual ApiKey so existing route handlers work unchanged
  req.apiKey = createApiKey({
    uid: tokenData.uid,
    scopes: tokenData.scopes,
    id: `oauth:${snap.docs[0].id}`,
  })

  next()
}

export function requireScope(...scopes: ApiKeyScope[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.apiKey
    if (!apiKey) {
      res.status(401).json({ error: 'Not authenticated' })
      return
    }

    const missing = scopes.filter(s => !apiKey.scopes.includes(s))
    if (missing.length > 0) {
      res.status(403).json({ error: `Missing required scopes: ${missing.join(', ')}` })
      return
    }

    next()
  }
}

// In-memory rate limiter: 60 requests per minute per API key
const WINDOW_MS = 60_000
const MAX_REQUESTS = 60

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const keyId = req.apiKey?.id
  if (!keyId) {
    next()
    return
  }

  const now = Date.now()
  let entry = rateLimitMap.get(keyId)

  if (!entry || now >= entry.resetAt) {
    entry = { count: 0, resetAt: now + WINDOW_MS }
    rateLimitMap.set(keyId, entry)
  }

  entry.count++

  res.setHeader('X-RateLimit-Limit', MAX_REQUESTS)
  res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS - entry.count))
  res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000))

  if (entry.count > MAX_REQUESTS) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000)
    res.setHeader('Retry-After', retryAfter)
    res.status(429).json({ error: 'Rate limit exceeded. Try again later.' })
    return
  }

  next()
}
