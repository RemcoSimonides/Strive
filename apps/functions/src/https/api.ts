import express from 'express'
import { onRequest } from 'firebase-functions/v2/https'

const app = express()

app.get('/status', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  })
})

export const api = onRequest({ cors: true, region: 'us-central1' }, app)
