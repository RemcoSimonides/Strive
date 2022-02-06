import { db, functions } from '../../internals/firebase';
import { logger } from 'firebase-functions';

import { createGoal, getAudience, Goal } from '@strive/goal/goal/+state/goal.firestore';
// Shared
import { upsertScheduledTask, deleteScheduledTask } from '../../shared/scheduled-task/scheduled-task';
import { enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface';
import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia';
import { handleNotificationsOfCreatedGoal, handleNotificationsOfChangedGoal } from './goal.notification';
import { deleteCollection } from '../../shared/utils';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';

export const goalCreatedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onCreate(async snapshot => {

    const goal = createGoal({ ...snapshot.data(), id: snapshot.id })
    const goalId = snapshot.id

    // algolia
    if (goal.publicity === 'public') {
      addToAlgolia('goal', goalId, {
        goalId,
        ...goal
      })
    }

    // notifications
    handleNotificationsOfCreatedGoal(goalId, goal)

    // deadline
    if (goal.deadline) {
      upsertScheduledTask(goalId, {
        worker: enumWorkerType.goalDeadline,
        performAt: goal.deadline,
        options: { goalId }
      })
    }
  })

export const goalDeletedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onDelete(async snapshot => {

    const goalId = snapshot.id
    const goal = createGoal({ ...snapshot.data(), id: snapshot.id }) 

    if (goal.publicity === 'public') {
      try {
        deleteFromAlgolia('goal', goalId)
      } catch (err) {
        logger.log('deleting from Algolia error', err)
      }
    }

    deleteScheduledTask(goalId)

    //delete subcollections too
    deleteCollection(db, `Goals/${goalId}/Milestones`, 500)
    deleteCollection(db, `Goals/${goalId}/Supports`, 500)
    deleteCollection(db, `Goals/${goalId}/Posts`, 500)
    deleteCollection(db, `Goals/${goalId}/InviteTokens`, 500)
    deleteCollection(db, `Goals/${goalId}/GStakeholders`, 500)
    deleteCollection(db, `Goals/${goalId}/Notifications`, 500)
    db.doc(`Discussions/${goalId}`).delete()
  })

export const goalChangeHandler = functions.firestore.document(`Goals/{goalId}`)
  .onUpdate(async (snapshot, context) => {

    const goalId = context.params.goalId
    const before = createGoal({ ...snapshot.before.data(), id: goalId })
    const after = createGoal({ ...snapshot.after.data(), id: goalId })

    // notifications
    handleNotificationsOfChangedGoal(goalId, before, after)

    if (before.status !== after.status || before.publicity !== after.publicity) {
      // update value on stakeholder docs
      updateGoalStakeholders(goalId, after)
    }

    if (before.title !== after.title) {
      // update ALL notifications
      updateGoalTitleInNotifications(goalId, after)
    }

    if (before.publicity !== after.publicity) {
      const audience = getAudience(after.publicity)
      db.doc(`Discussions/${goalId}`).update({ audience })

      if (after.publicity === 'public') {
        // add to algolia
        addToAlgolia('goal', goalId, {
          goalId,
          ...after
        })
      } else {
        // delete goal from Algolia index
        deleteFromAlgolia('goal', goalId)
      }

    } else if (before.title !== after.title || before.image !== after.image || before.numberOfAchievers !== after.numberOfAchievers || before.numberOfSupporters !== after.numberOfSupporters) {
      updateAlgoliaObject('goal', goalId, after)
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
//     roadmapTemplate: goal.roadmapTemplate,
//     collectiveGoalId: goal.collectiveGoalId,
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

async function updateGoalTitleInNotifications(goalId: string, after: Goal) {
  // user notifications and goal notifications
  const snaps = await db.collectionGroup(`Notifications`).where('source.goal.id', '==', goalId).get()
  logger.log(`Goal title edited. Going to update ${snaps.size} notifications`)
  const batch = db.batch()
  snaps.forEach(snap => batch.update(snap.ref, { 'source.goal.title': after.title }))
  batch.commit()
}
