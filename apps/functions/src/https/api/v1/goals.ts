import { Router } from 'express'
import { db } from '@strive/api/firebase'
import { createGoal, createMilestone } from '@strive/model'
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
