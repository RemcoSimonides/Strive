import { createHash, randomBytes } from 'crypto'

const KEY_PREFIX = 'sk_live_'

export function generateApiKey(): { rawKey: string; hashedKey: string; prefix: string } {
  const bytes = randomBytes(32)
  const rawKey = `${KEY_PREFIX}${bytes.toString('hex')}`
  const hashedKey = hashApiKey(rawKey)
  const prefix = rawKey.slice(0, 16)
  return { rawKey, hashedKey, prefix }
}

export function hashApiKey(rawKey: string): string {
  return createHash('sha256').update(rawKey).digest('hex')
}
