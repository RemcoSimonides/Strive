import { db, functions, serverTimestamp, logger, increment } from '../../../internals/firebase'

import {
  Goal,
  createMilestone,
  Milestone,
  createGoalSource,
  createSupport,
  User,
  UserLink
} from '@strive/model'

// Shared
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { toDate } from '../../../shared/utils'
import { getDocument } from '../../../shared/utils'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'

export const milestoneCreatedhandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
  .onCreate(async (snapshot, context) => {

    const milestone = createMilestone(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { goalId, milestoneId } = context.params

    // events
    const [goal, user] = await Promise.all([
      getDocument<Goal>(`Goals/${goalId}`),
      getDocument<User>(`Users/${milestone.updatedBy}`)
    ])
  
    const source = createGoalSource({ goal, milestone, user })
    addGoalEvent('goalMilestoneCreated', source)

    // progress
    const completed = milestone.status === 'failed' || milestone.status === 'succeeded'
    const data: Partial<Goal> = { tasksTotal: increment(1) as any }
    if (completed) goal.tasksCompleted = increment(1) as any
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

    // update source
    if (before.content !== after.content) {
      // DANGEROUS! because content is updated every 500ms automatically when changing. Better to have enum.gRoadmapUpdated event and schedule to update it max 1x per hour
      // OR use milestoneId only in sources
      await updateContentInSources(goalId, after)
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
  
  const [goal, user] = await Promise.all([
    getDocument<Goal>(`Goals/${goalId}`),
    getDocument<User>(`Users/${after.updatedBy}`)
  ])

  const source = createGoalSource({
    goal,
    milestone: after,
    user
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
  for (const snap of supportsSnap.docs) {
    const support = createSupport(toDate({ ...snap.data(), id: snap.id }))
    support.needsDecision = serverTimestamp() as any

    batch.update(snap.ref, support as any) // TODO remove any when updating pacakges https://github.com/firebase/firebase-js-sdk/issues/5853
  }
  batch.commit()
}

async function updateContentInSources(goalId: string, milestone: Milestone) {
  let batch = db.batch()

  // Goal Events
  batch = db.batch()
  const goalEventSnaps = await db.collection('GoalEvents').where('source.milestone.id', '==', milestone.id).get()
  logger.log(`Milestone content edited. Going to update ${goalEventSnaps.size} goal events`)
  goalEventSnaps.forEach(snap => batch.update(snap.ref, { 'source.milesstone.content': milestone.content }))
  batch.commit()

  // Supports
  batch = db.batch()
  const supportSnaps = await db.collection(`Goals/${goalId}/Supports`).where('source.milestone.id', '==', milestone.id).get()
  logger.log(`Milestone content edited. Going to update ${supportSnaps.size} supports`)
  supportSnaps.forEach(snap => batch.update(snap.ref, { 'source.milestone.content': milestone.content }))
  batch.commit()
}