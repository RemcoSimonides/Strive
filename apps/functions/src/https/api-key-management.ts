import { db, onCall, logger } from '@strive/api/firebase'
import { createApiKey } from '@strive/model'
import { toDate } from '../shared/utils'

export const listApiKeysCallable = onCall(async (request) => {
  const uid = request.auth?.uid
  if (!uid) {
    return { error: 'Unauthorized. Must be signed in.' }
  }

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

  return { data: keys }
})

export const revokeApiKeyCallable = onCall(async (request) => {
  const uid = request.auth?.uid
  if (!uid) {
    return { error: 'Unauthorized. Must be signed in.' }
  }

  const { keyId } = request.data ?? {}
  if (!keyId || typeof keyId !== 'string') {
    return { error: 'keyId is required and must be a string' }
  }

  const keyDoc = await db.doc(`ApiKeys/${keyId}`).get()
  if (!keyDoc.exists) {
    return { error: 'API key not found' }
  }

  const keyData = keyDoc.data()
  if (!keyData) {
    return { error: 'API key not found' }
  }
  if (keyData['uid'] !== uid) {
    return { error: 'You can only revoke your own API keys' }
  }

  if (keyData['revoked']) {
    return { error: 'API key is already revoked' }
  }

  await keyDoc.ref.update({ revoked: true, updatedAt: new Date() })
  logger.log(`API key revoked by user ${uid}: ${keyId}`)

  return { data: { id: keyId, revoked: true } }
})
