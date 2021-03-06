import { db, functions } from '../../internals/firebase';

import { createGoal, Goal } from '@strive/goal/goal/+state/goal.firestore';
// Shared
import { upsertScheduledTask, deleteScheduledTask } from '../../shared/scheduled-task/scheduled-task';
import { enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface';
import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia';
import { handleNotificationsOfCreatedGoal, handleNotificationsOfChangedGoal } from './goal.notification';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { deleteCollection, ErrorResultResponse, getDocument } from '../../shared/utils';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Profile } from '@strive/user/user/+state/user.firestore';
import { createMilestone } from '@strive/milestone/+state/milestone.firestore';
import { logger } from 'firebase-functions';

export const goalCreatedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onCreate(async snapshot => {

    const goal = createGoal(snapshot.data())
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
    if (!!goal.deadline) {
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

    try {
      deleteFromAlgolia('goal', goalId)
    } catch (err) {
      console.log('deleting from Algolia error', err)
    }
    deleteScheduledTask(goalId)

    //delete subcollections too
    deleteCollection(db, `Goals/${goalId}/Milestones`, 500)
    deleteCollection(db, `Goals/${goalId}/Supports`, 500)
    deleteCollection(db, `Goals/${goalId}/Posts`, 500)
    deleteCollection(db, `Goals/${goalId}/InviteTokens`, 500)
    deleteCollection(db, `Goals/${goalId}/GStakeholders`, 500)
    deleteCollection(db, `Goals/${goalId}/Notificaitons`, 500)
  })

export const goalChangeHandler = functions.firestore.document(`Goals/{goalId}`)
  .onUpdate(async (snapshot, context) => {

    const before = createGoal(snapshot.before.data())
    const after = createGoal(snapshot.after.data())
    const goalId = context.params.goalId

    // notifications
    handleNotificationsOfChangedGoal(goalId, before, after)

    if (before.isFinished !== after.isFinished || before.publicity !== after.publicity || before.title !== after.title) {
      // update value on stakeholder docs
      updateGoalStakeholders(goalId, after)
    }

    if (before.isFinished !== after.isFinished) {
      if (after.isFinished) {
        handleUnfinishedMilestones(goalId)
      }
    }

    if (before.publicity !== after.publicity) {
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

    } else if (before.title !== after.title || before.image !== after.image || before.shortDescription !== after.shortDescription) {
      updateAlgoliaObject('goal', goalId, after)
    }

    // deadline
    if (before.deadline !== after.deadline) {
      if (!after.isOverdue) {
        upsertScheduledTask(goalId, {
          worker: enumWorkerType.goalDeadline,
          performAt: after.deadline ? after.deadline : '',
          options: { goalId}
        })
      }
    }
  })

export const duplicateGoal = functions.https.onCall(async (data: { goalId: string }, context: CallableContext): Promise<ErrorResultResponse> => {

  if (!context.auth) {
    logger.error(`UNAUTHORIZED - User needs to be authorized`)
    return {
      error: `UNAUTHORIZED`,
      result: `User needs to be authorized`
    }
  }

  const uid = context.auth.uid;

  // Duplicate goal
  const goal = await getDocument<Goal>(`Goals/${data.goalId}`)
  const newGoal = createGoal({
    title: goal.title,
    description: goal.description,
    shortDescription: goal.shortDescription,
    image: goal.image,
    publicity: goal.publicity,
    deadline: goal.deadline,
    roadmapTemplate: goal.roadmapTemplate,
    collectiveGoalId: goal.collectiveGoalId,
  })
  const { id } = await db.collection(`Goals`).add(newGoal)
  db.doc(`Goals/${id}`).update({ id });

  // Create stakeholder
  const profile = await getDocument<Profile>(`Users/${uid}/Profile/${uid}`)
  const stakeholder = createGoalStakeholder({
    uid: uid,
    username: profile.username,
    photoURL: profile.photoURL,
    isAchiever: true,
    isAdmin: true,
    goalId: id,
    goalTitle: goal.title,
    goalPublicity: goal.publicity,
    goalImage: goal.image
  })
  await db.doc(`Goals/${id}/GStakeholders/${uid}`).set(stakeholder)

  // Creating milestones
  const promises: any[] = []
  for (const milestone of goal.roadmapTemplate) {
    const newMilestone = createMilestone({
      description: milestone.description,
      sequenceNumber: milestone.sequenceNumber,
      deadline: milestone.deadline
    })
    const promise = db.collection(`Goals/${id}/Milestones`).add(newMilestone)
    promises.push(promise);
  }
  await Promise.all(promises);
  return {
    error: '',
    result: id
  }
})

async function updateGoalStakeholders(goalId: string, after: Goal) {
  const stakeholderSnaps = await db.collection(`Goals/${goalId}/GStakeholders`).get()
  const promises = stakeholderSnaps.docs.map(doc => doc.ref.update({
    goalId,
    goalTitle: after.title,
    goalPublicity: after.publicity,
    goalIsFinished: after.isFinished
  }))
  return Promise.all(promises)
}

async function handleUnfinishedMilestones(goalId: string) {
  const milestonesSnap = await db
    .collection(`Goals/${goalId}/Milestones`)
    .where('status', '==', 'pending')
    .get()
    
  const promises = milestonesSnap.docs.map(doc => doc.ref.update({
    status: 'neutral'
  }))
  return Promise.all(promises)
}
