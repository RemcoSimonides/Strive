import { db, functions, serverTimestamp, logger, increment } from '../../../internals/firebase'

import {
  Goal,
  createMilestone,
  Milestone,
  createGoalSource,
  SupportBase
} from '@strive/model'

// Shared
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { toDate } from '../../../shared/utils'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'

export const milestoneCreatedhandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
  .onCreate(async (snapshot, context) => {

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

export const milestoneDeletedHandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
  .onDelete(async (snapshot, context) => {

    const { goalId, milestoneId } = context.params

    // scheduled task
    await deleteScheduledTask(milestoneId)

    // delete supports
    // get supports
    const supportssColSnap = await db.collection(`Goals/${goalId}/Supports`)
      .where('milestone.id', '==', milestoneId)
      .get()

    const promises = supportssColSnap.docs.map(snap => db.doc(`Goals/${goalId}/Supports/${snap.id}`).delete())
    await Promise.all(promises)
  })

export const milestoneChangeHandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
  .onUpdate(async (snapshot, context) => {

    const before = createMilestone(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
    const after = createMilestone(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))
    const { goalId, milestoneId } = context.params

    // events
    await handleMilestoneEvents(before, after, goalId)

    const completed = (before.status === 'pending' || before.status === 'overdue') && (after.status === 'failed' || after.status === 'succeeded')
    if (completed) {
      db.doc(`Goals/${goalId}`).update({
        tasksCompleted: increment(1)
      })
    }

    // scheduled tasks
    if (before.status === 'pending' && (after.status === 'succeeded' || after.status === 'failed')) { 
      deleteScheduledTask(milestoneId)
    }

    if (before.deadline !== after.deadline) {
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

  if (after.status === 'overdue') {
    addGoalEvent('goalMilestoneDeadlinePassed', source)
    addStoryItem('goalMilestoneDeadlinePassed', source)
  }

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
  const supportsSnap = await db.collection(`Goals/${goalId}/Supports`).where('source.milestone.id', '==', milestone.id).get()
  
  // TODO batch might get bigger than 500
  const batch = db.batch()
  for (const doc of supportsSnap.docs) {
    const support: Partial<SupportBase> = {
      needsDecision: serverTimestamp() as any
    }

    batch.update(doc.ref, support)
  }
  batch.commit()
}
