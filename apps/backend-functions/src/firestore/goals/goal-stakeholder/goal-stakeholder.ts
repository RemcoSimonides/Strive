import { db, admin, functions, increment } from '../../../internals/firebase';

// interfaces
import { createGoal, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createCollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';
import { handleNotificationsOfStakeholderCreated, handleNotificationsOfStakeholderChanged } from './goal-stakeholder.notification'
import { createProfile } from '@strive/user/user/+state/user.firestore';
import { createCollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';


export const goalStakeholderCreatedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onCreate(async (snapshot, context) => {

    const stakeholder = createGoalStakeholder(snapshot.data())
    const goalId = context.params.goalId
    const stakeholderId = snapshot.id

    // check if goal has collective goal
    const goalSnap = await db.doc(`Goals/${goalId}`).get()
    const goal = createGoal({ ...goalSnap.data(), id: goalId })

    if (stakeholder.isAchiever) {
      upsertCollectiveGoalStakeholder(goal, stakeholderId, true)
      changeNumberOfAchievers(goalId, stakeholder.isAchiever)
    }

    if (stakeholder.isSupporter) {
      changeNumberOfSupporters(goalId, stakeholder.isSupporter)
    }

    // notifications
    handleNotificationsOfStakeholderCreated(goal, stakeholder)
  })

export const goalStakeholderChangeHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onUpdate(async (snapshot, context) => {

    const before = createGoalStakeholder(snapshot.before.data())
    const after = createGoalStakeholder(snapshot.after.data())
    const stakeholderId = context.params.stakeholderId
    const goalId = context.params.goalId

    // notifications
    handleNotificationsOfStakeholderChanged(goalId, before, after)

    // isAchiever changed
    if (before.isAchiever !== after.isAchiever) {
      changeNumberOfAchievers(goalId, after.isAchiever)
      updateAchieverOnCollectiveGoal(goalId, stakeholderId, after.isAchiever)
    }

    //Increase or decrease number of Supporters
    if (before.isSupporter !== after.isSupporter) {
      changeNumberOfSupporters(goalId, after.isSupporter)
    }
  })

function changeNumberOfAchievers(goalId: string, isAchiever: boolean) {
  const goalRef = db.doc(`Goals/${goalId}`)
  return goalRef.update({
    numberOfAchievers: increment(isAchiever ? 1 : -1)
  })
}

function changeNumberOfAchieversOfCollectiveGoal(collectiveGoalId: string, isAchiever: boolean) {
  const collectiveGoalRef = db.doc(`CollectiveGoals/${collectiveGoalId}`)
  return collectiveGoalRef.update({
    numberOfAchievers: increment(isAchiever ? 1 : -1)
  })
}

function changeNumberOfSupporters(goalId: string, isSupporter: boolean) {
  const goalRef = db.doc(`Goals/${goalId}`)
  return goalRef.update({
    numberOfSupporters: increment(isSupporter ? 1 : -1)
  })
}

async function updateAchieverOnCollectiveGoal(goalId: string, stakeholderId: string, isAchiever: boolean) {
  const goalDocSnap = await db.doc(`Goals/${goalId}`).get()
  const goal = createGoal({ ...goalDocSnap.data(), id: goalId })

  if (goal.collectiveGoalId) {
    upsertCollectiveGoalStakeholder(goal, stakeholderId, isAchiever)
    changeNumberOfAchieversOfCollectiveGoal(goal.collectiveGoalId, isAchiever)
  }
}

async function upsertCollectiveGoalStakeholder(goal: Goal, stakeholderId: string, isAchiever: boolean) {

  // check if goal has collective goal
  if (!goal.collectiveGoalId) return; // No collective goal to update
  const collectiveGoalId = goal.collectiveGoalId

  // add user as collective goal stakeholder
  const collectiveGoalStakeholderRef = db.doc(`CollectiveGoals/${collectiveGoalId}/CGStakeholders/${stakeholderId}`)
  const collectiveGoalStakeholderSnap = await collectiveGoalStakeholderRef.get()
    
  if (collectiveGoalStakeholderSnap.exists) {
    // set as achiever
    await collectiveGoalStakeholderRef.update({ isAchiever })
    // note: collectiveGoalStakeholder is not deleted even if stakeholder does not have any rights anymore.
  } else {

    const [profileSnap, collectiveGoalSnap] = await Promise.all([
      db.doc(`Users/${stakeholderId}/Profile/${stakeholderId}`).get(),
      db.doc(`CollectiveGoals/${collectiveGoalId}`).get()
    ])
    const profile = createProfile(profileSnap.data())
    const collectiveGoal = createCollectiveGoal(collectiveGoalSnap.data())

    // create new stakeholder
    const collectiveGoalStakeholder = createCollectiveGoalStakeholder({
      uid: stakeholderId,
      username: profile.username,
      photoURL: profile.photoURL,
      isAchiever,
      isAdmin: false,
      isSpectator: false,
      collectiveGoalId: collectiveGoalId,
      collectiveGoalTitle: collectiveGoal.title,
      collectiveGoalIsSecret: collectiveGoal.isSecret,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })
    await db.doc(`CollectiveGoals/${collectiveGoalId}/CGStakeholders/${stakeholderId}`).create(collectiveGoalStakeholder)
  }
}
