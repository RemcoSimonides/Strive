import { db, functions, increment, serverTimestamp } from '../../internals/firebase'
import { logger } from 'firebase-functions'

import {
  createGoal,
  Goal,
  createGoalSource,
  createSupport,
  createMilestone,
  GoalStakeholder,
  User,
  createAggregation,
  createAlgoliaGoal
} from '@strive/model'
import { upsertScheduledTask, deleteScheduledTask } from '../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface'
import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia'
import { deleteCollection, getDocument, toDate } from '../../shared/utils'
import { addGoalEvent } from '../../shared/goal-event/goal.events'
import { addStoryItem } from '../../shared/goal-story/story'
import { updateAggregation } from '../../shared/aggregation/aggregation'


export const goalCreatedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onCreate(async snapshot => {

    const goal = createGoal(toDate({ ...snapshot.data(), id: snapshot.id }))
    const goalId = snapshot.id

    // event
    const user = await getDocument<User>(`Users/${goal.updatedBy}`)
    const source = createGoalSource({ goal, user })
    const event = goal.isFinished ? 'goalCreatedFinished' : 'goalCreated'
    addGoalEvent(event, source)
    addStoryItem(event, source)
    
    // aggregation
    handleAggregation(undefined, goal)

    // deadline
    if (goal.deadline) {
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

export const goalDeletedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onDelete(async snapshot => {

    const goal = createGoal(toDate({ ...snapshot.data(), id: snapshot.id }))

    // aggregation
    handleAggregation(goal, undefined)

    // event
    const source = createGoalSource({ goal })
    addGoalEvent('goalDeleted', source)

    deleteScheduledTask(goal.id)

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

export const goalChangeHandler = functions.firestore.document(`Goals/{goalId}`)
  .onUpdate(async (snapshot, context) => {

    const goalId = context.params.goalId
    const before = createGoal(toDate({ ...snapshot.before.data(), id: goalId }))
    const after = createGoal(toDate({ ...snapshot.after.data(), id: goalId }))

    const publicityChanged = before.publicity !== after.publicity
    const becamePublic = before.publicity !== 'public' && after.publicity === 'public'

    const becameFinished = !before.isFinished && !!after.isFinished

    handleAggregation(before, after)

    // events
    if (becameFinished) {
      logger.log('Goal is finished')
      const user = await getDocument<User>(`Users/${after.updatedBy}`)
      const source = createGoalSource({ goal: after, user, postId: goalId })
      addGoalEvent('goalIsFinished', source)
      addStoryItem('goalIsFinished', source)

      supportsNeedDecision(after)
      
      snapshot.after.ref.update({
        tasksCompleted: increment(1)
      })
    }

    // Update goal stakeholders
    if (publicityChanged) {
      updateGoalStakeholders(goalId, after)
    }

    if (before.title !== after.title || before.image !== after.image) {
      updateSources(after)
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

  const becameFinished = !before.isFinished && !!after.isFinished
  const wasFinished = !!before.isFinished && !after.isFinished

  aggregation.goalsPublic = becamePublic ? 1 : wasPublic ? -1 : 0
  aggregation.goalsPrivate = becamePrivate ? 1 : wasPrivate ? -1 : 0

  aggregation.goalsFinished = becameFinished ? 1 : wasFinished ? -1 : 0

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

async function updateSources(goal: Goal) {
  let batch = db.batch()

  const source = {
    'source.goal.title': goal.title,
    'source.goal.image': goal.image
  }

  // Notifications
  const notificationSnaps = await db.collectionGroup('Notifications').where('source.goal.id', '==', goal.id).get()
  logger.log(`Goal title edited. Going to update ${notificationSnaps.size} notifications`)
  notificationSnaps.forEach(snap => batch.update(snap.ref, source))
  batch.commit()

  // Goal Events
  batch = db.batch()
  const goalEventSnaps = await db.collection('GoalEvents').where('source.goal.id', '==', goal.id).get()
  logger.log(`Goal title edited. Going to update ${goalEventSnaps.size} goal events`)
  goalEventSnaps.forEach(snap => batch.update(snap.ref, source))
  batch.commit()

  // Supports
  batch = db.batch()
  const supportSnaps = await db.collection(`Goals/${goal.id}/Supports`).get()
  logger.log(`Goal title edited. Going to update ${supportSnaps.size} supports`)
  supportSnaps.forEach(snap => batch.update(snap.ref, source))
  batch.commit()
}

export async function supportsNeedDecision(goal: Goal) {
  const milestonesQuery = db.collection(`Goals/${goal.id}/Milestones`)
    .where('status', '==', 'pending')

  const supportsQuery = db.collection(`Goals/${goal.id}/Supports`)
    .where('source.goal.id', '==', goal.id)
    .where('needsDecision', '==', false)

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
    const support = createSupport(toDate({ ...snap.data(), id: snap.id }))

    const milestoneId = support.source.milestone?.id
    if (milestoneId && !pendingMilestoneIds.includes(milestoneId)) continue // meaning the milestone of this support is not pending and thus skip
    
    support.needsDecision = timestamp

    batch.update(snap.ref, { ...support })
  }
  batch.commit()
}