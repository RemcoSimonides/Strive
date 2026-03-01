import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

/**
 * Encrypts plaintext using AES-256-GCM.
 * Returns a base64 string containing: IV + ciphertext + auth tag.
 */
export function encrypt(plaintext: string, secret: string): string {
  const key = Buffer.from(secret, 'hex')
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const authTag = cipher.getAuthTag()

  return Buffer.concat([iv, encrypted, authTag]).toString('base64')
}

/**
 * Decrypts a base64 string produced by encrypt().
 * Expects format: IV (12 bytes) + ciphertext + auth tag (16 bytes).
 */
export function decrypt(ciphertext: string, secret: string): string {
  const key = Buffer.from(secret, 'hex')
  const data = Buffer.from(ciphertext, 'base64')

  const iv = data.subarray(0, IV_LENGTH)
  const authTag = data.subarray(data.length - AUTH_TAG_LENGTH)
  const encrypted = data.subarray(IV_LENGTH, data.length - AUTH_TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(authTag)

  return decipher.update(encrypted) + decipher.final('utf8')
}
