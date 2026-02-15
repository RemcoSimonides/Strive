import express from 'express'
import { onRequest } from 'firebase-functions/v2/https'
import { authenticateApiKey, rateLimit } from '../shared/api-key'
import { goalsRouter } from './api/v1/goals'
import { usersRouter } from './api/v1/users'
import { apiKeysRouter } from './api/v1/api-keys'

const app = express()

app.use(express.json())

// Public health check
app.get('/status', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

// Authenticated v1 API routes
const v1 = express.Router()
v1.use(authenticateApiKey)
v1.use(rateLimit)
v1.use('/goals', goalsRouter)
v1.use('/users', usersRouter)
v1.use('/api-keys', apiKeysRouter)

app.use('/api/v1', v1)

// 404 handler for unmatched routes
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})

export const api = onRequest({ cors: true, region: 'us-central1' }, app)
