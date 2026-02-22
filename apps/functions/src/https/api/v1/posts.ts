import { Router } from 'express'
import { db } from '@strive/api/firebase'
import { createPost } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { requireScope } from '../../../shared/api-key'

export const postsRouter = Router({ mergeParams: true })

// GET /api/v1/goals/:goalId/posts — list posts for a goal
postsRouter.get('/', requireScope('posts:read'), async (req, res) => {
  const { goalId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  // Verify stakeholder access
  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 50, 1), 100)

  const postsSnap = await db.collection(`Goals/${goalId}/Posts`)
    .orderBy('date', 'desc')
    .limit(limit)
    .get()

  const posts = postsSnap.docs.map(doc =>
    createPost(toDate({ ...doc.data(), id: doc.id }))
  )

  res.json({ data: posts })
})

// GET /api/v1/goals/:goalId/posts/:postId — get single post
postsRouter.get('/:postId', requireScope('posts:read'), async (req, res) => {
  const { goalId, postId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const postDoc = await db.doc(`Goals/${goalId}/Posts/${postId}`).get()
  if (!postDoc.exists) {
    res.status(404).json({ error: 'Post not found' })
    return
  }

  const post = createPost(toDate({ ...postDoc.data(), id: postDoc.id }))
  res.json({ data: post })
})

// POST /api/v1/goals/:goalId/posts — create a post
postsRouter.post('/', requireScope('posts:write'), async (req, res) => {
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
    res.status(403).json({ error: 'Only admins and achievers can create posts' })
    return
  }

  // Verify goal exists
  const goalDoc = await db.doc(`Goals/${goalId}`).get()
  if (!goalDoc.exists) {
    res.status(404).json({ error: 'Goal not found' })
    return
  }

  const { description, date, url, milestoneId } = req.body

  if (!description || typeof description !== 'string') {
    res.status(400).json({ error: 'description is required and must be a string' })
    return
  }

  const now = new Date()
  const post = createPost({
    description,
    date: date ? new Date(date) : now,
    url: url || '',
    milestoneId: milestoneId || '',
    goalId: goalId as string,
    uid: uid as string,
    createdAt: now,
    updatedAt: now,
  })

  const { id: _, medias: _m, ...postData } = post
  const docRef = await db.collection(`Goals/${goalId}/Posts`).add(postData)

  res.status(201).json({ data: createPost({ ...postData, id: docRef.id }) })
})

// DELETE /api/v1/goals/:goalId/posts/:postId — delete a post
postsRouter.delete('/:postId', requireScope('posts:write'), async (req, res) => {
  const { goalId, postId } = req.params
  const uid = req.apiKey?.uid
  if (!uid) { res.status(401).json({ error: 'Not authenticated' }); return }

  const stakeholderDoc = await db.doc(`Goals/${goalId}/GStakeholders/${uid}`).get()
  if (!stakeholderDoc.exists) {
    res.status(403).json({ error: 'You are not a stakeholder of this goal' })
    return
  }

  const postDoc = await db.doc(`Goals/${goalId}/Posts/${postId}`).get()
  if (!postDoc.exists) {
    res.status(404).json({ error: 'Post not found' })
    return
  }

  const postData = postDoc.data()
  const stakeholder = stakeholderDoc.data()

  // Only post owner or goal admin can delete
  if (postData?.uid !== uid && !stakeholder?.isAdmin) {
    res.status(403).json({ error: 'Only post owner or goal admin can delete posts' })
    return
  }

  await postDoc.ref.delete()

  res.json({ data: { id: postId, deleted: true } })
})
