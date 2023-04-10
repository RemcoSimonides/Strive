import { db, logger, gcsBucket, increment, onDocumentCreate, onDocumentDelete, onDocumentUpdate, serverTimestamp } from '@strive/api/firebase'
import { isEqual, isFuture } from 'date-fns'

import {
  createGoal,
  Goal,
  createGoalSource,
  createSupportBase,
  createMilestone,
  GoalStakeholder,
  createAggregation,
  createAlgoliaGoal,
  EventType,
  SupportBase
} from '@strive/model'
import { upsertScheduledTask, deleteScheduledTask } from '../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface'
import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia'
import { deleteCollection, toDate } from '../../shared/utils'
import { addGoalEvent } from '../../shared/goal-event/goal.events'
import { addStoryItem } from '../../shared/goal-story/story'
import { updateAggregation } from '../../shared/aggregation/aggregation'


export const goalCreatedHandler = onDocumentCreate(`Goals/{goalId}`, 'goalCreatedHandler',
async snapshot => {

  const goal = createGoal(toDate({ ...snapshot.data(), id: snapshot.id }))
  const goalId = snapshot.id

  // event
  const source = createGoalSource({ goalId, userId: goal.updatedBy })
  const event = goal.status === 'pending' ?  'goalCreated' : 'goalCreatedFinished'
  addGoalEvent(event, source)
  addStoryItem(event, source)

  // aggregation
  handleAggregation(undefined, goal)

  // deadline
  if (goal.deadline && isFuture(goal.deadline)) {
    upsertScheduledTask(goalId, {
      worker: enumWorkerType.goalDeadline,
      performAt: goal.deadline,
      options: { goalId }
    })
  }

  // algolia
  if (goal.publicity === 'public') {
    await addToAlgolia('goal', goalId, createAlgoliaGoal(goal))
  }
})

export const goalDeletedHandler = onDocumentDelete(`Goals/{goalId}`, 'goalDeletedHandler',
async snapshot => {

  const goal = createGoal(toDate({ ...snapshot.data(), id: snapshot.id }))

  // aggregation
  handleAggregation(goal, undefined)

  // event
  const source = createGoalSource({ goalId: goal.id })
  addGoalEvent('goalDeleted', source)

  deleteScheduledTask(goal.id)

  const notificationsSnap = await db.collectionGroup('Notifications').where('goalId', '==', goal.id).get()
  notificationsSnap.docs.forEach(doc => doc.ref.delete())

  if (goal.image) {
    gcsBucket.file(goal.image).delete({ ignoreNotFound: true })
  }

  //delete subcollections too
  deleteCollection(db, `Goals/${goal.id}/Milestones`, 500)
  deleteCollection(db, `Goals/${goal.id}/Supports`, 500)
  deleteCollection(db, `Goals/${goal.id}/Posts`, 500)
  deleteCollection(db, `Goals/${goal.id}/InviteTokens`, 500)
  deleteCollection(db, `Goals/${goal.id}/GStakeholders`, 500)
  deleteCollection(db, `Goals/${goal.id}/Story`, 500)
  deleteCollection(db, `Goals/${goal.id}/Comments`, 500)

  if (goal.publicity === 'public') {
    await deleteFromAlgolia('goal', goal.id)
  }
})

export const goalChangeHandler = onDocumentUpdate(`Goals/{goalId}`, 'goalChangeHandler',
async (snapshot, context) => {

  const goalId = context.params.goalId
  const before = createGoal(toDate({ ...snapshot.before.data(), id: goalId }))
  const after = createGoal(toDate({ ...snapshot.after.data(), id: goalId }))

  const publicityChanged = before.publicity !== after.publicity
  const becamePublic = before.publicity !== 'public' && after.publicity === 'public'

  const becameFinishedSuccessfully = before.status ==='pending' && after.status === 'succeeded'
  const becameFinishedUnsuccessfully = before.status === 'pending' && after.status === 'failed'

  const deadlineChanged = !isEqual(before.deadline, after.deadline)

  handleAggregation(before, after)

  // events
  if (becameFinishedSuccessfully || becameFinishedUnsuccessfully) {
    logger.log('Goal finished')
    const source = createGoalSource({ goalId, userId: after.updatedBy })
    const name: EventType = becameFinishedSuccessfully ? 'goalFinishedSuccessfully' : 'goalFinishedUnsuccessfully'
    addGoalEvent(name, source)
    addStoryItem(name, source)

    supportsNeedDecision(after, becameFinishedSuccessfully)

    snapshot.after.ref.update({
      tasksCompleted: increment(1)
    })
  }

  // Update goal stakeholders
  if (publicityChanged) {
    updateGoalStakeholders(goalId, after)
  }

  if (becameFinishedSuccessfully || becameFinishedUnsuccessfully) {
    const batch = db.batch()
    const stakeholders = await db.collection(`Goals/${goalId}/GStakeholders`).where('focus.on', '==', true).get()
    for (const { ref } of stakeholders.docs) {
      batch.update(ref, { 'focus.on': false })
    }
    batch.commit()
  }

  if (deadlineChanged) {
    if (isFuture) {
      upsertScheduledTask(goalId, {
        worker: enumWorkerType.goalDeadline,
        performAt: after.deadline,
        options: { goalId }
      })
    } else {
      deleteScheduledTask(goalId)
    }
  }

  // algolia
  if (publicityChanged) {
    if (becamePublic) {
      addToAlgolia('goal', goalId, createAlgoliaGoal(after))
    } else {
      await deleteFromAlgolia('goal', goalId)
    }

  } else if (before.title !== after.title || before.image !== after.image || before.numberOfAchievers !== after.numberOfAchievers || before.numberOfSupporters !== after.numberOfSupporters) {
    await updateAlgoliaObject('goal', goalId, createAlgoliaGoal(after))
  }
})

function handleAggregation(before: undefined | Goal, after: undefined | Goal) {
  const aggregation = createAggregation()

  if (!before && !!after) aggregation.goalsCreated++
  if (!!before && !after) aggregation.goalsDeleted++

  const becamePublic = before?.publicity !== 'public' && after?.publicity === 'public'
  const wasPublic = before?.publicity === 'public' && after?.publicity !== 'public'

  const becamePrivate = before?.publicity !== 'private' && after?.publicity === 'private'
  const wasPrivate = before?.publicity === 'public' && after?.publicity !== 'private'

  const becameFinished = before?.status === 'pending' && after !== undefined && after.status !== 'pending'
  const wasFinished = before !== undefined && before.status !== 'pending' && after?.status === 'pending'
  const becameFinishedSuccessfully = before?.status === 'pending' && after?.status === 'succeeded'
  const becameFinishedUnsuccessfully = before?.status === 'pending' && after?.status === 'failed'

  aggregation.goalsPublic = becamePublic ? 1 : wasPublic ? -1 : 0
  aggregation.goalsPrivate = becamePrivate ? 1 : wasPrivate ? -1 : 0

  aggregation.goalsFinished = becameFinished ? 1 : wasFinished ? -1 : 0
  aggregation.goalsFinishedSuccessfully = becameFinishedSuccessfully ? 1 : 0
  aggregation.goalsFinishedUnsuccessfully = becameFinishedUnsuccessfully ? 1 : 0

  updateAggregation(aggregation)
}

async function updateGoalStakeholders(goalId: string, after: Goal) {
  const data: Partial<GoalStakeholder> = {
    goalId,
    goalPublicity: after.publicity
  }

  const stakeholderSnaps = await db.collection(`Goals/${goalId}/GStakeholders`).get()
  const promises = stakeholderSnaps.docs.map(doc => doc.ref.update(data))
  return Promise.all(promises)
}

export async function supportsNeedDecision(goal: Goal, successful: boolean) {
  const milestonesQuery = db.collection(`Goals/${goal.id}/Milestones`)
    .where('status', '==', 'pending')

  const supportsQuery = db.collection(`Goals/${goal.id}/Supports`)
    .where('goalId', '==', goal.id)

   const [supportsSnap, milestonesSnap] = await Promise.all([
    supportsQuery.get(),
    milestonesQuery.get()
   ])

   const milestones = milestonesSnap.docs.map(snap => createMilestone(toDate({...snap.data(), id: snap.id })))
   const pendingMilestoneIds = milestones.map(milestone => milestone.id)

  // TODO batch might get bigger than 500
  const batch = db.batch()
  const timestamp = serverTimestamp() as any
  for (const snap of supportsSnap.docs) {
    const support = createSupportBase(toDate({ ...snap.data(), id: snap.id }))

    const isCounter = support.counterDescription && !successful
    if (isCounter && support.counterStatus !== 'open') continue
    if (!isCounter && support.status !== 'open') continue

    const { milestoneId } = support
    if (milestoneId && !pendingMilestoneIds.includes(milestoneId)) continue // meaning the milestone of this support is not pending and thus skip

    let result: Partial<SupportBase>
    if (isCounter) {
      result = { counterNeedsDecision: timestamp }
    } else {
      result = { needsDecision: timestamp }
    }

    batch.update(snap.ref, result)
  }
  batch.commit()
}