import { Router } from 'express'
import { db } from '@strive/api/firebase'
import { ApiKeyScope, createApiKey } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { generateApiKey } from '../../../shared/api-key'

const VALID_SCOPES: ApiKeyScope[] = [
  'goals:read', 'goals:write', 'milestones:read', 'milestones:write',
  'user:read', 'posts:read', 'supports:read'
]

export const apiKeysRouter = Router()

// POST /api/v1/api-keys — create new key
apiKeysRouter.post('/', async (req, res) => {
  const requestingKey = req.apiKey
  if (!requestingKey) { res.status(401).json({ error: 'Not authenticated' }); return }
  const { name, scopes, expiresAt } = req.body

  if (!name || typeof name !== 'string') {
    res.status(400).json({ error: 'name is required and must be a string' })
    return
  }

  if (!Array.isArray(scopes) || scopes.length === 0) {
    res.status(400).json({ error: 'scopes must be a non-empty array' })
    return
  }

  const invalidScopes = scopes.filter((s: string) => !VALID_SCOPES.includes(s as ApiKeyScope))
  if (invalidScopes.length > 0) {
    res.status(400).json({ error: `Invalid scopes: ${invalidScopes.join(', ')}` })
    return
  }

  // Non-escalation: can't grant scopes the requesting key doesn't have
  const escalated = scopes.filter((s: string) => !requestingKey.scopes.includes(s as ApiKeyScope))
  if (escalated.length > 0) {
    res.status(403).json({ error: `Cannot grant scopes you don't have: ${escalated.join(', ')}` })
    return
  }

  // Check max 10 active keys per user
  const existingSnap = await db.collection('ApiKeys')
    .where('uid', '==', requestingKey.uid)
    .where('revoked', '==', false)
    .get()

  if (existingSnap.size >= 10) {
    res.status(400).json({ error: 'Maximum of 10 active API keys per user' })
    return
  }

  const { rawKey, hashedKey, prefix } = generateApiKey()

  const now = new Date()
  const apiKeyData = createApiKey({
    uid: requestingKey.uid,
    name,
    prefix,
    hashedKey,
    scopes: scopes as ApiKeyScope[],
    expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    createdAt: now,
    updatedAt: now,
  })

  const { id: _, ...dataWithoutId } = apiKeyData
  const docRef = await db.collection('ApiKeys').add(dataWithoutId)

  res.status(201).json({
    data: {
      id: docRef.id,
      name: apiKeyData.name,
      prefix: apiKeyData.prefix,
      scopes: apiKeyData.scopes,
      expiresAt: apiKeyData.expiresAt ?? null,
      createdAt: apiKeyData.createdAt,
    },
    key: rawKey // Only returned once
  })
})

// GET /api/v1/api-keys — list own keys (hash stripped)
apiKeysRouter.get('/', async (req, res) => {
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const snapshot = await db.collection('ApiKeys')
    .where('uid', '==', uid)
    .where('revoked', '==', false)
    .get()

  const keys = snapshot.docs.map(doc => {
    const data = createApiKey(toDate({ ...doc.data(), id: doc.id }))
    return {
      id: data.id,
      name: data.name,
      prefix: data.prefix,
      scopes: data.scopes,
      lastUsedAt: data.lastUsedAt ?? null,
      expiresAt: data.expiresAt ?? null,
      createdAt: data.createdAt,
    }
  })

  res.json({ data: keys })
})

// DELETE /api/v1/api-keys/:keyId — soft-revoke a key
apiKeysRouter.delete('/:keyId', async (req, res) => {
  const { keyId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const keyDoc = await db.doc(`ApiKeys/${keyId}`).get()
  if (!keyDoc.exists) {
    res.status(404).json({ error: 'API key not found' })
    return
  }

  const keyData = keyDoc.data()
  if (!keyData) {
    res.status(404).json({ error: 'API key not found' })
    return
  }
  if (keyData['uid'] !== uid) {
    res.status(403).json({ error: 'You can only revoke your own API keys' })
    return
  }

  if (keyData['revoked']) {
    res.status(400).json({ error: 'API key is already revoked' })
    return
  }

  await keyDoc.ref.update({ revoked: true, updatedAt: new Date() })
  res.json({ data: { id: keyId, revoked: true } })
})
