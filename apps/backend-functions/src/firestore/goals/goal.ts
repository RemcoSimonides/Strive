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
import { createMilestone, enumMilestoneStatus } from '@strive/milestone/+state/milestone.firestore';

export const goalCreatedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onCreate(async (snapshot, context) => {

    const goal = createGoal(snapshot.data())
    const goalId = snapshot.id

    // algolia
    if (goal.publicity === 'public') {
      await addToAlgolia('goal', goalId, {
        goalId: goalId,
        ...goal
      })
    }

    // notifications
    await handleNotificationsOfCreatedGoal(goalId, goal)

    // deadline
    if (!!goal.deadline) {
      await upsertScheduledTask(goalId, {
        worker: enumWorkerType.goalDeadline,
        performAt: goal.deadline,
        options: {
            goalId: goalId
        }
      })
    }
  })

export const goalDeletedHandler = functions.firestore.document(`Goals/{goalId}`)
  .onDelete(async (snapshot, context) => {

    const goalId = snapshot.id

    try {
      await deleteFromAlgolia('goal', goalId)
    } catch (err) {
      console.log('deleting from Algolia error', err)
    }
    await deleteScheduledTask(goalId)

    const promises: any[] = []
    
    //delete subcollections too
    promises.push(deleteCollection(db, `Goals/${goalId}/Milestones`, 500))
    promises.push(deleteCollection(db, `Goals/${goalId}/Supports`, 500))
    promises.push(deleteCollection(db, `Goals/${goalId}/Posts`, 500))
    promises.push(deleteCollection(db, `Goals/${goalId}/InviteTokens`, 500))
    promises.push(deleteCollection(db, `Goals/${goalId}/GStakeholders`, 500))

    await Promise.all(promises)
  })

export const goalChangeHandler = functions.firestore.document(`Goals/{goalId}`)
  .onUpdate(async (snapshot, context) => {

    const before = createGoal(snapshot.before.data())
    const after = createGoal(snapshot.after.data())
    const goalId = context.params.goalId

    // notifications
    await handleNotificationsOfChangedGoal(goalId, before, after)

    if (before.isFinished !== after.isFinished ||
      before.publicity !== after.publicity ||
      before.title !== after.title) {

      // change value on stakeholder docs
      await updateGoalStakeholders(goalId, after)
    }

    if (before.isFinished !== after.isFinished) {
      if (after.isFinished) {
        await handleUnfinishedMilestones(goalId)
      }
    }

    if (before.publicity !== after.publicity) {
      if (after.publicity === 'public') {
        // add to algolia
        await addToAlgolia('goal', goalId, {
          goalId: goalId,
          ...after
        })
      } else {
        // delete goal from Algolia index
        await deleteFromAlgolia('goal', goalId)
      }

    } else if (before.title !== after.title ||
      before.image !== after.image ||
      before.shortDescription !== after.shortDescription) {

      await updateAlgoliaObject('goal', goalId, after)
    }

    // deadline
    if (before.deadline !== after.deadline) {
      if (!after.isOverdue) {
        await upsertScheduledTask(goalId, {
          worker: enumWorkerType.goalDeadline,
          performAt: after.deadline ? after.deadline : '',
          options: {
              goalId: goalId
          }
        })
      }
    }
  })

export const duplicateGoal = functions.https.onCall(async (data: { goalId: string }, context: CallableContext): Promise<ErrorResultResponse> => {

  if (!context.auth) {
    return {
      error: `UNAUTHORIZED`,
      result: `User needs to be authorized`
    }
  }

  const uid = context.auth.uid;

  // Duplicate goal
  const goal = await getDocument<Goal>(`Goals/${data.goalId}`)
  console.log('pre goal: ', JSON.stringify(goal))
  const newGoal = createGoal({
    title: goal.title,
    description: goal.description,
    shortDescription: goal.shortDescription,
    image: goal.image,
    publicity: goal.publicity,
    deadline: goal.deadline,
    milestoneTemplateObject: goal.milestoneTemplateObject,
    collectiveGoal: {
      id: goal.collectiveGoal?.id,
      title: goal.collectiveGoal?.title,
      isPublic: goal.collectiveGoal?.isPublic,
      image: goal.collectiveGoal?.image
    }
  })
  console.log('new Goal: ', JSON.stringify(newGoal))
  const { id } = await db.collection(`Goals`).add(newGoal)
  console.log('Goal created: ', id);

  console.log('uid:', uid)

  // Create stakeholder
  const profile = await getDocument<Profile>(`Users/${uid}/Profile/${uid}`)
  console.log('profile: ', JSON.stringify(profile))
  const stakeholder = createGoalStakeholder({
    uid: uid,
    username: profile.username,
    photoURL: profile.image,
    isAchiever: true,
    isAdmin: true,
    goalId: id,
    goalTitle: goal.title,
    goalPublicity: goal.publicity,
    goalImage: goal.image
  })
  await db.doc(`Goals/${id}/GStakeholders/${uid}`).set(stakeholder)
  console.log('stakeholder created! ', JSON.stringify(stakeholder))

  // Creating milestone
  const promises: any[] = []
  for (const milestone of goal.milestoneTemplateObject) {
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

  const stakeholdersColRef = db.collection(`Goals/${goalId}/GStakeholders`)
  const stakeholdersSnap = await stakeholdersColRef.get()
    
  const promises: any[] = []
  stakeholdersSnap.forEach(stakeholderSnap => {

    const promise = stakeholderSnap.ref.update({
      goalId: goalId,
      goalTitle: after.title,
      goalPublicity: after.publicity,
      goalIsFinished: after.isFinished
    })

    promises.push(promise)
  })

  await Promise.all(promises)
}

async function handleUnfinishedMilestones(goalId: string) {

  const milestonesRef = db.collection(`Goals/${goalId}/Milestones`).where('status', '==', enumMilestoneStatus.pending)
  const milestonesSnap = await milestonesRef.get()
    
  const promises: any[] = []
  milestonesSnap.forEach(milestoneSnap => {
    const promise = milestoneSnap.ref.update({
      status: enumMilestoneStatus.neutral
    })
    promises.push(promise)
  })
  await Promise.all(promises)
}
