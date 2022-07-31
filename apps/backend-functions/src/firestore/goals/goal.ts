import { admin, db, functions } from '../../internals/firebase';
import { logger } from 'firebase-functions';

import { createGoal, getAudience, Goal, GoalStatus, createGoalLink } from '@strive/goal/goal/+state/goal.firestore';
// Shared
import { upsertScheduledTask, deleteScheduledTask } from '../../shared/scheduled-task/scheduled-task';
import { enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface';
import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia';
import { converter, deleteCollection, getDocument, toDate } from '../../shared/utils';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { addGoalEvent } from './goal.events';
import { createGoalSource, DiscussionSource, enumEvent } from '@strive/notification/+state/notification.firestore';
import { User } from '@strive/user/user/+state/user.firestore';
import { getReceiver } from '../../shared/support/receiver';
import { createMilestone, Milestone } from '@strive/goal/milestone/+state/milestone.firestore';
import { createSupport, Support } from '@strive/support/+state/support.firestore';
import { addDiscussion } from '../../shared/discussion/discussion';

const { serverTimestamp } = admin.firestore.FieldValue

export const goalCreatedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onCreate(async snapshot => {

    const goal = createGoal(toDate({ ...snapshot.data(), id: snapshot.id }))
    const goalId = snapshot.id

    // TODO rework discussion
    const discussionSource: DiscussionSource = {
      goal: createGoalLink({ ...goal, id: goalId })
    }
    const audience = getAudience(goal.publicity)
    await addDiscussion(`General discussion`, discussionSource, audience, goalId, goal.updatedBy)

    // event
    const user = await getDocument<User>(`Users/${goal.updatedBy}`)
    const event: Record<GoalStatus, enumEvent> = {
      bucketlist: enumEvent.gNewBucketlist,
      active: enumEvent.gNewActive,
      finished: enumEvent.gNewFinished
    }
    const source = createGoalSource({ goal, user })
    const name = event[goal.status]
    addGoalEvent(name, source)

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
      await addToAlgolia('goal', goalId, { goalId, ...goal })
    }
  })

export const goalDeletedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onDelete(async snapshot => {

    const goal = createGoal(toDate({ ...snapshot.data(), id: snapshot.id }))

    deleteScheduledTask(goal.id)

    //delete subcollections too
    deleteCollection(db, `Goals/${goal.id}/Milestones`, 500)
    deleteCollection(db, `Goals/${goal.id}/Supports`, 500)
    deleteCollection(db, `Goals/${goal.id}/Posts`, 500)
    deleteCollection(db, `Goals/${goal.id}/InviteTokens`, 500)
    deleteCollection(db, `Goals/${goal.id}/GStakeholders`, 500)
    db.doc(`Discussions/${goal.id}`).delete()

    if (goal.publicity === 'public') {
      await deleteFromAlgolia('goal', goal.id)
     }
  })

export const goalChangeHandler = functions.firestore.document(`Goals/{goalId}`)
  .onUpdate(async (snapshot, context) => {

    const goalId = context.params.goalId
    const before = createGoal(toDate({ ...snapshot.before.data(), id: goalId }))
    const after = createGoal(toDate({ ...snapshot.after.data(), id: goalId }))

    // events
    const isFinished = before.status !== 'finished' && after.status === 'finished'
    if (isFinished) {
      logger.log('Goal is finished')
      const user = await getDocument<User>(`Users/${after.updatedBy}`)
      const source = createGoalSource({ goal: after, user, postId: goalId })
      addGoalEvent(enumEvent.gFinished, source)

      supportsNeedDecision(after)
    }

    if (before.status !== after.status || before.publicity !== after.publicity) {
      // update value on stakeholder docs
      updateGoalStakeholders(goalId, after)
    }

    if (before.title !== after.title) {
      updateTitleInSources(after)
    }

    if (before.publicity !== after.publicity) {
      const audience = getAudience(after.publicity)
      db.doc(`Discussions/${goalId}`).update({ audience })

      if (after.publicity === 'public') {
        // add to algolia
        await addToAlgolia('goal', goalId, {
          goalId,
          ...after
        })
      } else {
        // delete goal from Algolia index
        await deleteFromAlgolia('goal', goalId)
      }

    } else if (before.title !== after.title || before.image !== after.image || before.numberOfAchievers !== after.numberOfAchievers || before.numberOfSupporters !== after.numberOfSupporters) {
      await updateAlgoliaObject('goal', goalId, after)
    }
  })

// export const duplicateGoal = functions.https.onCall(async (data: { goalId: string, uid: string }, context: CallableContext): Promise<ErrorResultResponse> => {

//   if (!context.auth) {
//     logger.error(`UNAUTHORIZED - User needs to be authorized`)
//     return {
//       error: `UNAUTHORIZED`,
//       result: `User needs to be authorized`
//     }
//   }

//   const uid = data.uid ? data.uid : context.auth.uid;
//   const timestamp = serverTimestamp()

//   // Duplicate goal
//   const goal = await getDocument<Goal>(`Goals/${data.goalId}`)
//   const newGoal = createGoal({
//     title: goal.title,
//     description: goal.description,
//     image: goal.image,
//     publicity: goal.publicity,
//     deadline: goal.deadline,
//     createdAt: timestamp as Timestamp,
//     updatedAt: timestamp as Timestamp,
//     updatedBy: uid
//   })
//   const { id } = await db.collection(`Goals`).add(newGoal)
//   db.doc(`Goals/${id}`).update({ id });

//   // Create stakeholder
//   const user = await getDocument<User>(`Users/${uid}`)
//   const stakeholder = createGoalStakeholder({
//     uid: uid,
//     username: user.username,
//     photoURL: user.photoURL,
//     isAchiever: true,
//     isAdmin: true,
//     goalId: id,
//     goalPublicity: goal.publicity,
//     createdAt: timestamp,
//     updatedAt: timestamp,
//     updatedBy: uid
//   })
//   await db.doc(`Goals/${id}/GStakeholders/${uid}`).set(stakeholder)

//   // Creating milestones
//   const promises: any[] = []
//   for (const milestone of goal.roadmapTemplate) {
//     const newMilestone = createMilestone({
//       description: milestone.description,
//       sequenceNumber: milestone.sequenceNumber,
//       deadline: milestone.deadline
//     })
//     const promise = db.collection(`Goals/${id}/Milestones`).add(newMilestone)
//     promises.push(promise);
//   }
//   await Promise.all(promises);
//   return {
//     error: '',
//     result: id
//   }
// })

async function updateGoalStakeholders(goalId: string, after: Goal) {
  const data: Partial<GoalStakeholder> = {
    goalId,
    goalPublicity: after.publicity
  }
  if (after.status === 'finished') data.status = 'finished'
  
  const stakeholderSnaps = await db.collection(`Goals/${goalId}/GStakeholders`).get()
  const promises = stakeholderSnaps.docs.map(doc => doc.ref.update(data))
  return Promise.all(promises)
}

async function updateTitleInSources(goal: Goal) {
  let batch = db.batch()

  // Notifications
  const notificationSnaps = await db.collectionGroup('Notifications').where('source.goal.id', '==', goal.id).get()
  logger.log(`Goal title edited. Going to update ${notificationSnaps.size} notifications`)
  notificationSnaps.forEach(snap => batch.update(snap.ref, { 'source.goal.title': goal.title }))
  batch.commit()

  // Goal Events
  batch = db.batch()
  const goalEventSnaps = await db.collection('GoalEvents').where('source.goal.id', '==', goal.id).get()
  logger.log(`Goal title edited. Going to update ${goalEventSnaps.size} goal events`)
  goalEventSnaps.forEach(snap => batch.update(snap.ref, { 'source.goal.title': goal.title }))
  batch.commit()

  // Supports
  batch = db.batch()
  const supportSnaps = await db.collection(`Goals/${goal.id}/Supports`).get()
  logger.log(`Goal title edited. Going to update ${supportSnaps.size} supports`)
  supportSnaps.forEach(snap => batch.update(snap.ref, { 'source.goal.title': goal.title }))
  batch.commit()
}

export async function supportsNeedDecision(goal: Goal) {
  const receiver = await getReceiver(goal.id, db)

  const milestonesQuery = db.collection(`Goals/${goal.id}/Milestones`)
    .where('status', '==', 'pending')
    .withConverter<Milestone>(converter(createMilestone))

  const supportsQuery = db.collection(`Goals/${goal.id}/Supports`)
    .where('source.goal.id', '==', goal.id)
    .where('needsDecision', '==', false)
    .withConverter<Support>(converter(createSupport))

   const [supportsSnap, milestonesSnap] = await Promise.all([
    supportsQuery.get(),
    milestonesQuery.get()
   ])

   const milestones = milestonesSnap.docs.map(snap => ({...snap.data(), id: snap.id }))
   const pendingMilestoneIds = milestones.map(milestone => milestone.id)

  // TODO batch might get bigger than 500
  const batch = db.batch()
  const timestamp = serverTimestamp() as any
  for (const snap of supportsSnap.docs) {
    const support = createSupport(toDate({ ...snap.data(), id: snap.id }))

    const milestoneId = support.source.milestone?.id
    if (milestoneId && !pendingMilestoneIds.includes(milestoneId)) continue // meaning the milestone of this support is not pending and thus skip
    
    support.needsDecision = timestamp

    if (milestoneId) {
      const milestone = milestones.find(m => m.id === support.source.milestone.id)
      support.source.receiver = milestone.achiever?.uid ? milestone.achiever : receiver
    } else {
      support.source.receiver = receiver
    }

    batch.update(snap.ref, support)
  }
  batch.commit()
}