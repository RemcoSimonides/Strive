import { db, functions } from '../../../internals/firebase';

//Interfaces
import { createMilestone, Milestone } from '@strive/milestone/+state/milestone.firestore';

// Shared
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task';
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface';
import { handleStatusChangeNotification } from './milestone.notification';

export const milestoneCreatedhandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
  .onCreate(async (snapshot, context) => {

    const milestone = snapshot.data()
    const goalId = context.params.goalId
    const milestoneId = snapshot.id
    if (!milestone) return

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

    const milestoneId = snapshot.id
    const goalId = context.params.goalId

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

    const before = createMilestone(snapshot.before.data())
    const after = createMilestone(snapshot.after.data())
    const goalId = context.params.goalId
    const milestoneId = context.params.milestoneId

    // Do not do anything with milestones which just have been set to neutral
    if (before.status === 'pending' && after.status === 'neutral') return

    //Milestone succeeded
    if (before.status !== after.status) { // Something has changed

      if (after.status !== 'neutral' && after.status !== 'overdue') await handleStatusChangeNotification(before, after, goalId, milestoneId)
      if (after.status !== 'pending' && after.status !== 'overdue') await handlePotentialSubmilestones(after, goalId)

      // TODO send notification if support is overdue
    }

    if (before.deadline !== after.deadline) {
      upsertScheduledTask(milestoneId, {
        worker: enumWorkerType.milestoneDeadline,
        performAt: after.deadline,
        options: { goalId, milestoneId }
      })
    }
  })

async function handlePotentialSubmilestones(milestone: Milestone, goalId: string) {

  // level 3 milestone doesn't have submilestones
  if (milestone.sequenceNumber.split('.').length === 3) return

  const oneSeqnoHigher = increaseSeqnoByOne(milestone.sequenceNumber)

  // get all submilestones
  const subMilestonesSnap = await db.collection(`Goals/${goalId}/Milestones`)
    .where('status', '==', 'pending')
    .where('sequenceNumber', '>', milestone.sequenceNumber)
    .where('sequenceNumber', '<', oneSeqnoHigher)
    .get()

  const promises = subMilestonesSnap.docs.map(subMilestoneSnap => subMilestoneSnap.ref.update({ status: 'neutral' }))
  return Promise.all(promises)
}

export function increaseSeqnoByOne(seqno: string): string {
  const segments = seqno.split('.');
  const last = segments.pop()
  const lastPlusOne = +last + 1
  segments.push(`${lastPlusOne}`)
  return segments.join('.')
}