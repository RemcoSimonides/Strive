import { db, onCall, logger } from '@strive/api/firebase'
import { ApiKeyScope, createApiKey } from '@strive/model'
import { generateApiKey } from '../shared/api-key'

const VALID_SCOPES: ApiKeyScope[] = [
  'goals:read', 'goals:write', 'milestones:read', 'milestones:write',
  'user:read', 'posts:read', 'supports:read'
]

export const createApiKeyCallable = onCall(async (request) => {
  const uid = request.auth?.uid
  if (!uid) {
    return { error: 'Unauthorized. Must be signed in.' }
  }

  const { name, scopes, expiresAt } = request.data ?? {}

  if (!name || typeof name !== 'string') {
    return { error: 'name is required and must be a string' }
  }

  if (!Array.isArray(scopes) || scopes.length === 0) {
    return { error: 'scopes must be a non-empty array' }
  }

  const invalidScopes = scopes.filter((s: string) => !VALID_SCOPES.includes(s as ApiKeyScope))
  if (invalidScopes.length > 0) {
    return { error: `Invalid scopes: ${invalidScopes.join(', ')}` }
  }

  // Enforce max 10 active keys per user
  const existingSnap = await db.collection('ApiKeys')
    .where('uid', '==', uid)
    .where('revoked', '==', false)
    .get()

  if (existingSnap.size >= 10) {
    return { error: 'Maximum of 10 active API keys per user' }
  }

  const { rawKey, hashedKey, prefix } = generateApiKey()

  const now = new Date()
  const apiKeyData = createApiKey({
    uid,
    name,
    prefix,
    hashedKey,
    scopes: scopes as ApiKeyScope[],
    expiresAt: expiresAt ? new Date(expiresAt) : null,
    createdAt: now,
    updatedAt: now,
  })

  const { id: _, ...dataWithoutId } = apiKeyData
  const docRef = await db.collection('ApiKeys').add(dataWithoutId)

  logger.log(`API key created for user ${uid}: ${docRef.id} (${prefix}...)`)

  return {
    id: docRef.id,
    name: apiKeyData.name,
    prefix: apiKeyData.prefix,
    scopes: apiKeyData.scopes,
    expiresAt: apiKeyData.expiresAt ?? null,
    createdAt: apiKeyData.createdAt,
    key: rawKey // Only returned once — user must store this
  }
})
