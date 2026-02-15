import { Router } from 'express'
import { db } from '@strive/api/firebase'
import { createUser } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { requireScope } from '../../../shared/api-key'

export const usersRouter = Router()

// GET /api/v1/users/me — get profile of API key owner
usersRouter.get('/me', requireScope('user:read'), async (req, res) => {
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const userDoc = await db.doc(`Users/${uid}`).get()
  if (!userDoc.exists) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  const user = createUser(toDate({ ...userDoc.data(), id: userDoc.id }))
  res.json({ data: user })
})
