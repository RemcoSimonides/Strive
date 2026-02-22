import { Router } from 'express'
import { db } from '@strive/api/firebase'
import { createGoal, createGoalStakeholder, createMilestone } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { requireScope } from '../../../shared/api-key'

export const goalsRouter = Router()

// GET /api/v1/goals — list goals where key owner is a stakeholder
goalsRouter.get('/', requireScope('goals:read'), async (req, res) => {
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderSnap = await db.collectionGroup('GStakeholders')
    .where('uid', '==', uid)
    .get()

  const goalIds = stakeholderSnap.docs.map(doc => doc.ref.parent.parent?.id).filter((id): id is string => !!id)

  if (goalIds.length === 0) {
    res.json({ data: [] })
    return
  }

  // Firestore 'in' queries support max 30 items
  const chunks: string[][] = []
  for (let i = 0; i < goalIds.length; i += 30) {
    chunks.push(goalIds.slice(i, i + 30))
  }

  const goals = []
  for (const chunk of chunks) {
    const goalsSnap = await db.collection('Goals')
      .where('__name__', 'in', chunk)
      .get()

    for (const doc of goalsSnap.docs) {
      goals.push(createGoal(toDate({ ...doc.data(), id: doc.id })))
    }
  }

  res.json({ data: goals })
})

// GET /api/v1/goals/:goalId — get single goal
goalsRouter.get('/:goalId', requireScope('goals:read'), async (req, res) => {
  const { goalId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  // Verify stakeholder access
  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const goalDoc = await db.doc(`Goals/${goalId}`).get()
  if (!goalDoc.exists) {
    res.status(404).json({ error: 'Goal not found' })
    return
  }

  const goal = createGoal(toDate({ ...goalDoc.data(), id: goalDoc.id }))
  res.json({ data: goal })
})

// POST /api/v1/goals — create a new goal
goalsRouter.post('/', requireScope('goals:write'), async (req, res) => {
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const { title, description, deadline, publicity, image } = req.body

  if (!title || typeof title !== 'string') {
    res.status(400).json({ error: 'title is required and must be a string' })
    return
  }

  const now = new Date()
  const goalId = db.collection('Goals').doc().id

  const goal = createGoal({
    id: goalId,
    title,
    description: description || '',
    deadline: deadline ? new Date(deadline) : undefined,
    publicity: publicity === 'public' ? 'public' : 'private',
    image: image || '',
    createdAt: now,
    updatedAt: now,
    updatedBy: uid,
  })

  // Create stakeholder first (matches client-side goal creation pattern)
  const stakeholder = createGoalStakeholder({
    uid,
    goalId,
    goalPublicity: goal.publicity,
    isAdmin: true,
    isAchiever: true,
    isSpectator: true,
    createdAt: now,
    updatedAt: now,
  })

  const { uid: _sUid, ...stakeholderData } = stakeholder
  await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).set(stakeholderData)

  const { id: _, ...goalData } = goal
  await db.doc(`Goals/${goalId}`).set(goalData)

  res.status(201).json({ data: goal })
})

// PATCH /api/v1/goals/:goalId — update a goal
goalsRouter.patch('/:goalId', requireScope('goals:write'), async (req, res) => {
  const { goalId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  // Verify admin access
  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const stakeholder = stakeholderDoc.data()
  if (!stakeholder?.isAdmin) {
    res.status(403).json({ error: 'Only admins can update goals' })
    return
  }

  const goalDoc = await db.doc(`Goals/${goalId}`).get()
  if (!goalDoc.exists) {
    res.status(404).json({ error: 'Goal not found' })
    return
  }

  const allowedFields = ['title', 'description', 'deadline', 'status', 'publicity']
  const update: Record<string, any> = {}

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'deadline') {
        update[field] = new Date(req.body[field])
      } else if (field === 'status' && !['pending', 'succeeded', 'failed'].includes(req.body[field])) {
        res.status(400).json({ error: 'status must be one of: pending, succeeded, failed' })
        return
      } else if (field === 'publicity' && !['public', 'private'].includes(req.body[field])) {
        res.status(400).json({ error: 'publicity must be one of: public, private' })
        return
      } else {
        update[field] = req.body[field]
      }
    }
  }

  if (Object.keys(update).length === 0) {
    res.status(400).json({ error: 'No valid fields to update. Allowed: title, description, deadline, status, publicity' })
    return
  }

  update.updatedBy = uid
  update.updatedAt = new Date()

  await db.doc(`Goals/${goalId}`).update(update)

  const updatedDoc = await db.doc(`Goals/${goalId}`).get()
  const goal = createGoal(toDate({ ...updatedDoc.data(), id: goalId }))

  res.json({ data: goal })
})

// GET /api/v1/goals/:goalId/milestones — list milestones
goalsRouter.get('/:goalId/milestones', requireScope('milestones:read'), async (req, res) => {
  const { goalId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const milestonesSnap = await db.collection(`Goals/${goalId}/Milestones`)
    .where('deletedAt', '==', null)
    .orderBy('order')
    .get()

  const milestones = milestonesSnap.docs.map(doc =>
    createMilestone(toDate({ ...doc.data(), id: doc.id }))
  )

  res.json({ data: milestones })
})

// GET /api/v1/goals/:goalId/milestones/:milestoneId — get single milestone
goalsRouter.get('/:goalId/milestones/:milestoneId', requireScope('milestones:read'), async (req, res) => {
  const { goalId, milestoneId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const milestoneDoc = await db.doc(`Goals/${goalId}/Milestones/${milestoneId}`).get()
  if (!milestoneDoc.exists) {
    res.status(404).json({ error: 'Milestone not found' })
    return
  }

  const milestone = createMilestone(toDate({ ...milestoneDoc.data(), id: milestoneDoc.id }))
  res.json({ data: milestone })
})

// POST /api/v1/goals/:goalId/milestones — create a milestone
goalsRouter.post('/:goalId/milestones', requireScope('milestones:write'), async (req, res) => {
  const { goalId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  // Verify admin or achiever access
  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const stakeholder = stakeholderDoc.data()
  if (!stakeholder?.isAdmin && !stakeholder?.isAchiever) {
    res.status(403).json({ error: 'Only admins and achievers can create milestones' })
    return
  }

  const goalDoc = await db.doc(`Goals/${goalId}`).get()
  if (!goalDoc.exists) {
    res.status(404).json({ error: 'Goal not found' })
    return
  }

  const { content, description, deadline, order, subtasks } = req.body

  if (!content || typeof content !== 'string') {
    res.status(400).json({ error: 'content is required and must be a string' })
    return
  }

  const now = new Date()
  const milestone = createMilestone({
    content,
    description: description || '',
    deadline: deadline ? new Date(deadline) : undefined,
    order: typeof order === 'number' ? order : 0,
    subtasks: Array.isArray(subtasks) ? subtasks : [],
    deletedAt: null,
    updatedBy: uid,
    createdAt: now,
    updatedAt: now,
  })

  const { id: _, achiever: _a, ...milestoneData } = milestone
  const docRef = await db.collection(`Goals/${goalId}/Milestones`).add(milestoneData)

  res.status(201).json({ data: createMilestone({ ...milestoneData, id: docRef.id }) })
})

// PATCH /api/v1/goals/:goalId/milestones/:milestoneId — update a milestone
goalsRouter.patch('/:goalId/milestones/:milestoneId', requireScope('milestones:write'), async (req, res) => {
  const { goalId, milestoneId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  // Verify admin or achiever access
  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const stakeholder = stakeholderDoc.data()
  if (!stakeholder?.isAdmin && !stakeholder?.isAchiever) {
    res.status(403).json({ error: 'Only admins and achievers can update milestones' })
    return
  }

  const milestoneDoc = await db.doc(`Goals/${goalId}/Milestones/${milestoneId}`).get()
  if (!milestoneDoc.exists) {
    res.status(404).json({ error: 'Milestone not found' })
    return
  }

  const allowedFields = ['content', 'description', 'deadline', 'status', 'order', 'subtasks']
  const update: Record<string, any> = {}

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      if (field === 'deadline') {
        update[field] = new Date(req.body[field])
      } else if (field === 'status' && !['pending', 'succeeded', 'failed'].includes(req.body[field])) {
        res.status(400).json({ error: 'status must be one of: pending, succeeded, failed' })
        return
      } else {
        update[field] = req.body[field]
      }
    }
  }

  if (Object.keys(update).length === 0) {
    res.status(400).json({ error: 'No valid fields to update. Allowed: content, description, deadline, status, order, subtasks' })
    return
  }

  update.updatedBy = uid
  update.updatedAt = new Date()

  await db.doc(`Goals/${goalId}/Milestones/${milestoneId}`).update(update)

  const updatedDoc = await db.doc(`Goals/${goalId}/Milestones/${milestoneId}`).get()
  const milestone = createMilestone(toDate({ ...updatedDoc.data(), id: milestoneId }))

  res.json({ data: milestone })
})

// DELETE /api/v1/goals/:goalId/milestones/:milestoneId — soft-delete a milestone
goalsRouter.delete('/:goalId/milestones/:milestoneId', requireScope('milestones:write'), async (req, res) => {
  const { goalId, milestoneId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  // Verify admin access
  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const stakeholder = stakeholderDoc.data()
  if (!stakeholder?.isAdmin) {
    res.status(403).json({ error: 'Only admins can delete milestones' })
    return
  }

  const milestoneDoc = await db.doc(`Goals/${goalId}/Milestones/${milestoneId}`).get()
  if (!milestoneDoc.exists) {
    res.status(404).json({ error: 'Milestone not found' })
    return
  }

  // Soft delete — matches app behavior
  await milestoneDoc.ref.update({
    deletedAt: new Date(),
    updatedBy: uid,
    updatedAt: new Date(),
  })

  res.json({ data: { id: milestoneId, deleted: true } })
})
