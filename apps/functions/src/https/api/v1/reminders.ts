import { Router } from 'express'
import { db } from '@strive/api/firebase'
import { createReminder } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { requireScope } from '../../../shared/api-key'

export const remindersRouter = Router({ mergeParams: true })

// GET /v1/goals/:goalId/reminders — list reminders for the authenticated user
remindersRouter.get('/', requireScope('reminders:read'), async (req, res) => {
  const { goalId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const remindersSnap = await db.collection(`Goals/${goalId}/GStakeholders/${uid}/Reminders`).get()

  const reminders = remindersSnap.docs.map(doc =>
    createReminder(toDate({ ...doc.data(), id: doc.id }))
  )

  res.json({ data: reminders })
})

// GET /v1/goals/:goalId/reminders/:reminderId — get single reminder
remindersRouter.get('/:reminderId', requireScope('reminders:read'), async (req, res) => {
  const { goalId, reminderId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const reminderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}/Reminders/${reminderId}`).get()
  if (!reminderDoc.exists) {
    res.status(404).json({ error: 'Reminder not found' })
    return
  }

  const reminder = createReminder(toDate({ ...reminderDoc.data(), id: reminderDoc.id }))
  res.json({ data: reminder })
})

// POST /v1/goals/:goalId/reminders — create a reminder
remindersRouter.post('/', requireScope('reminders:write'), async (req, res) => {
  const { goalId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const { description, interval, isRepeating, date, dayOfWeek, numberOfWeek } = req.body

  const validIntervals = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'never']
  if (interval && !validIntervals.includes(interval)) {
    res.status(400).json({ error: `interval must be one of: ${validIntervals.join(', ')}` })
    return
  }

  const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  if (dayOfWeek && !validDays.includes(dayOfWeek)) {
    res.status(400).json({ error: `dayOfWeek must be one of: ${validDays.join(', ')}` })
    return
  }

  const now = new Date()
  const reminder = createReminder({
    description: description || '',
    interval: interval || 'weekly',
    isRepeating: isRepeating ?? true,
    date: date ? new Date(date) : now,
    dayOfWeek: dayOfWeek || undefined,
    numberOfWeek: typeof numberOfWeek === 'number' ? numberOfWeek : 0,
    updatedBy: uid,
    createdAt: now,
    updatedAt: now,
  })

  const { id: _, ...reminderData } = reminder
  const docRef = await db.collection(`Goals/${goalId}/GStakeholders/${uid}/Reminders`).add(reminderData)

  res.status(201).json({ data: createReminder({ ...reminderData, id: docRef.id }) })
})

// PATCH /v1/goals/:goalId/reminders/:reminderId — update a reminder
remindersRouter.patch('/:reminderId', requireScope('reminders:write'), async (req, res) => {
  const { goalId, reminderId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const reminderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}/Reminders/${reminderId}`).get()
  if (!reminderDoc.exists) {
    res.status(404).json({ error: 'Reminder not found' })
    return
  }

  const allowedFields = ['description', 'interval', 'isRepeating', 'date', 'dayOfWeek', 'numberOfWeek']
  const update: Record<string, any> = {}

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'interval') {
        const validIntervals = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly', 'never']
        if (!validIntervals.includes(req.body[field])) {
          res.status(400).json({ error: `interval must be one of: ${validIntervals.join(', ')}` })
          return
        }
      }
      if (field === 'dayOfWeek') {
        const validDays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
        if (!validDays.includes(req.body[field])) {
          res.status(400).json({ error: `dayOfWeek must be one of: ${validDays.join(', ')}` })
          return
        }
      }
      if (field === 'date') {
        update[field] = new Date(req.body[field])
      } else {
        update[field] = req.body[field]
      }
    }
  }

  if (Object.keys(update).length === 0) {
    res.status(400).json({ error: 'No valid fields to update. Allowed: description, interval, isRepeating, date, dayOfWeek, numberOfWeek' })
    return
  }

  update.updatedBy = uid
  update.updatedAt = new Date()

  await reminderDoc.ref.update(update)

  const updatedDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}/Reminders/${reminderId}`).get()
  const reminder = createReminder(toDate({ ...updatedDoc.data(), id: reminderId }))

  res.json({ data: reminder })
})

// DELETE /v1/goals/:goalId/reminders/:reminderId — delete a reminder
remindersRouter.delete('/:reminderId', requireScope('reminders:write'), async (req, res) => {
  const { goalId, reminderId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const reminderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}/Reminders/${reminderId}`).get()
  if (!reminderDoc.exists) {
    res.status(404).json({ error: 'Reminder not found' })
    return
  }

  await reminderDoc.ref.delete()

  res.json({ data: { id: reminderId, deleted: true } })
})
