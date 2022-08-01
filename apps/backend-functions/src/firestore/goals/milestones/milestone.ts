import { db, functions, admin } from '../../../internals/firebase';
import { logger } from 'firebase-functions';

//Interfaces
import { createMilestone, Milestone } from '@strive/goal/milestone/+state/milestone.firestore';

// Shared
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task';
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface';
import { toDate } from '../../../shared/utils';
import { getDocument } from '../../..//shared/utils';
import { Goal } from '@strive/model';
import { addGoalEvent } from '../goal.events';
import { createGoalSource, enumEvent } from '@strive/notification/+state/notification.firestore';
import { User, UserLink } from '@strive/user/user/+state/user.firestore';
import { createSupport } from '@strive/support/+state/support.firestore';
import { getReceiver } from '../../../shared/support/receiver'

const { serverTimestamp } = admin.firestore.FieldValue

export const milestoneCreatedhandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
  .onCreate(async (snapshot, context) => {

    const milestone = createMilestone(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { goalId, milestoneId } = context.params

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

    await deleteScheduledTask(milestoneId)

    // delete supports
    // get supports
    const supportssColSnap = await db.collection(`Goals/${goalId}/Supports`)
      .where('milestone.id', '==', milestoneId)
      .get()

    const promises = supportssColSnap.docs.map(snap => db.doc(`Goals/${goalId}/Supports/${snap.id}`).delete())
    await Promise.all(promises);

    // send notification (not here but at support function)

  })

export const milestoneChangeHandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
  .onUpdate(async (snapshot, context) => {

    const before = createMilestone(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
    const after = createMilestone(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))
    const { goalId, milestoneId } = context.params

    // events
    await handleMilestoneEvents(before, after, goalId)

    // update source
    if (before.content !== after.content) {
      // DANGEROUS! because content is updated every 500ms automatically when changing. Better to have enum.gRoadmapUpdated event and schedule to update it max 1x per hour
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
    addGoalEvent(enumEvent.gMilestoneDeadlinePassed, source)
  }

  if (after.status === 'succeeded') {
    source.postId = after.id
    addGoalEvent(enumEvent.gMilestoneCompletedSuccessfully, source)
  }

  if (after.status === 'failed') {
    source.postId = after.id
    addGoalEvent(enumEvent.gMilestoneCompletedUnsuccessfully, source)
  }

  const isCompleted = after.status === 'succeeded' || after.status === 'failed'
  if (isCompleted) {
    supportsNeedDecision(goalId, after)
  }
}

async function supportsNeedDecision(goalId: string, milestone: Milestone) {
  const supportsSnap = await db.collection(`Goals/${goalId}/Supports`).where('source.milestone.id', '==', milestone.id).get()
  const receiver: UserLink = milestone.achiever?.uid ? milestone.achiever : await getReceiver(goalId, db)

  // TODO batch might get bigger than 500
  const batch = db.batch()
  for (const snap of supportsSnap.docs) {
    const support = createSupport(toDate({ ...snap.data(), id: snap.id }))
    support.needsDecision = serverTimestamp() as any

    support.source.receiver = receiver

    batch.update(snap.ref, support)
  }
  batch.commit()
}

async function updateContentInSources(goalId: string, milestone: Milestone) {
  let batch = db.batch()

  // Notifications
  const notificationSnaps = await db.collectionGroup('Notifications').where('source.milestone.id', '==', milestone.id).get()
  logger.log(`Milestone content edited. Going to update ${notificationSnaps.size} notifications`)
  notificationSnaps.forEach(snap => batch.update(snap.ref, { 'source.milestone.content': milestone.content }))
  batch.commit()

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