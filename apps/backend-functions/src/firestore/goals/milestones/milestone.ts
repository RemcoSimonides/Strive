import { db, serverTimestamp, increment, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '../../../internals/firebase'

import { Goal, createMilestone, Milestone, createGoalSource, SupportBase, createSupportBase } from '@strive/model'

import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { toDate } from '../../../shared/utils'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'
import { isEqual } from 'date-fns'

export const milestoneCreatedhandler = onDocumentCreate(`Goals/{goalId}/Milestones/{milestoneId}`, 'milestoneCreatedhandler',
async (snapshot, context) => {

  const milestone = createMilestone(toDate({ ...snapshot.data(), id: snapshot.id }))
  const { goalId, milestoneId } = context.params

  // events
  const source = createGoalSource({ goalId, userId: milestone.updatedBy })
  addGoalEvent('goalMilestoneCreated', source)

  // progress
  const completed = milestone.status === 'failed' || milestone.status === 'succeeded'
  const data: Partial<Goal> = { tasksTotal: increment(1) as any }
  if (completed) data.tasksCompleted = increment(1) as any
  db.doc(`Goals/${goalId}`).update(data)

  // scheduled task
  if (milestone.deadline) {
    upsertScheduledTask(milestoneId, {
      worker: enumWorkerType.milestoneDeadline,
      performAt: milestone.deadline,
      options: { goalId, milestoneId }
    })
  }
})

export const milestoneDeletedHandler = onDocumentDelete(`Goals/{goalId}/Milestones/{milestoneId}`, 'milestoneDeletedHandler',
async (snapshot, context) => {

  const { goalId, milestoneId } = context.params

  milestoneDeleted(goalId, milestoneId)
})

export const milestoneChangeHandler = onDocumentUpdate(`Goals/{goalId}/Milestones/{milestoneId}`, 'milestoneChangeHandler',
async (snapshot, context) => {

  const before = createMilestone(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
  const after = createMilestone(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))
  const { goalId, milestoneId } = context.params

  // events
  await handleMilestoneEvents(before, after, goalId)

  const deleted = before.deletedAt === null && after.deletedAt !== null
  if (deleted) {
    milestoneDeleted(goalId, milestoneId)
  }

  const completed = before.status === 'pending' && (after.status === 'failed' || after.status === 'succeeded')
  if (completed) {
    db.doc(`Goals/${goalId}`).update({
      tasksCompleted: increment(1)
    })
  }

  // scheduled tasks
  if (before.status === 'pending' && (after.status === 'succeeded' || after.status === 'failed')) { 
    deleteScheduledTask(milestoneId)
  }

  if (!isEqual(before.deadline, after.deadline)) {
    upsertScheduledTask(milestoneId, {
      worker: enumWorkerType.milestoneDeadline,
      performAt: after.deadline,
      options: { goalId, milestoneId }
    })
  }
})

async function handleMilestoneEvents(before: Milestone, after: Milestone, goalId: string) {
  if (before.status === after.status) return

  const source = createGoalSource({
    goalId,
    milestoneId: after.id,
    userId: after.updatedBy
  })

  if (after.status === 'succeeded') {
    addGoalEvent('goalMilestoneCompletedSuccessfully', source)
    addStoryItem('goalMilestoneCompletedSuccessfully', source)
  }

  if (after.status === 'failed') {
    addGoalEvent('goalMilestoneCompletedUnsuccessfully', source)
    addStoryItem('goalMilestoneCompletedUnsuccessfully', source)
  }

  const isCompleted = after.status === 'succeeded' || after.status === 'failed'
  if (isCompleted) {
    supportsNeedDecision(goalId, after)
  }
}

async function supportsNeedDecision(goalId: string, milestone: Milestone) {
  const supportsSnap = await db.collection(`Goals/${goalId}/Supports`).where('milestoneId', '==', milestone.id).get()
  
  // TODO batch might get bigger than 500
  const batch = db.batch()
  const timestamp = serverTimestamp() as any
  for (const doc of supportsSnap.docs) {
    const support = createSupportBase(toDate({ ...doc.data(), id: doc.id }))
    const isCounter = support.counterDescription && milestone.status === 'failed'

    let result: Partial<SupportBase>
    if (isCounter) {
      result = { counterNeedsDecision: timestamp }
    } else {
      result = { needsDecision: timestamp }
    }

    batch.update(doc.ref, result)
  }
  batch.commit()
}

async function milestoneDeleted(goalId: string, milestoneId: string) {
  // scheduled task
  await deleteScheduledTask(milestoneId)

  // delete supports
  // get supports
  const supportssColSnap = await db.collection(`Goals/${goalId}/Supports`)
    .where('milestone.id', '==', milestoneId)
    .get()

  const promises = supportssColSnap.docs.map(snap => db.doc(`Goals/${goalId}/Supports/${snap.id}`).delete())
  await Promise.all(promises)
}
