import { db, admin, functions, increment } from '../../../internals/firebase';

// interfaces
import { createGoal } from '@strive/goal/goal/+state/goal.firestore'
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { CollectiveGoalStakeholder, createCollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';
import { handleNotificationsOfStakeholderCreated, handleNotificationsOfStakeholderChanged } from './goal-stakeholder.notification'


export const goalStakeholderCreatedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onCreate(async (snapshot, context) => {

    const stakeholder = createGoalStakeholder(snapshot.data())
    const goalId = context.params.goalId
    const stakeholderId = snapshot.id
    if (!stakeholder) return

    if (stakeholder.isAchiever) {
      await upsertCollectiveGoalStakeholder(goalId, stakeholderId, true)
      await changeNumberOfAchievers(goalId, stakeholder.isAchiever)
    }

    if (stakeholder.isSupporter) {
      await changeNumberOfSupporters(goalId, stakeholder.isSupporter)
    }

    // notifications
    await handleNotificationsOfStakeholderCreated(goalId, stakeholder)
  })

export const goalStakeholderChangeHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onUpdate(async (snapshot, context) => {

    const before = createGoalStakeholder(snapshot.before.data())
    const after = createGoalStakeholder(snapshot.after.data())
    const stakeholderId = context.params.stakeholderId
    const goalId = context.params.goalId

    // notifications
    await handleNotificationsOfStakeholderChanged(goalId, before, after)

    // isAchiever changed
    if (before.isAchiever !== after.isAchiever) {
      await changeNumberOfAchievers(goalId, after.isAchiever)
      await updateAchieverOnCollectiveGoal(goalId, stakeholderId, after.isAchiever)
    }

    //Increase or decrease number of Supporters
    if (before.isSupporter !== after.isSupporter) {
      await changeNumberOfSupporters(goalId, after.isSupporter)
    }
  })

async function changeNumberOfAchievers(goalId: string, isAchiever: boolean) {

  const goalRef = db.doc(`Goals/${goalId}`)
  await goalRef.update({
    numberOfAchievers: increment(isAchiever ? 1 : -1)
  })
}

async function changeNumberOfAchieversOfCollectiveGoal(collectiveGoalId: string, isAchiever: boolean) {

  const collectiveGoalRef = db.doc(`CollectiveGoals/${collectiveGoalId}`)
  await collectiveGoalRef.update({
    numberOfAchievers: increment(isAchiever ? 1 : -1)
  })
}

async function changeNumberOfSupporters(goalId: string, isSupporter: boolean) {

  const goalRef = db.doc(`Goals/${goalId}`)
  await goalRef.update({
    numberOfSupporters: increment(isSupporter ? 1 : -1)
  })
}

async function updateAchieverOnCollectiveGoal(goalId: string, stakeholderId: string, isAchiever: boolean) {

  const goalDocRef = db.doc(`Goals/${goalId}`)
  const goalDocSnap = await goalDocRef.get()
  const goal = createGoal(goalDocSnap.data())

  if (goal.collectiveGoal) {
    await upsertCollectiveGoalStakeholder(goalId, stakeholderId, isAchiever)
    await changeNumberOfAchieversOfCollectiveGoal(goal.collectiveGoal.id, isAchiever)
  }
}

async function upsertCollectiveGoalStakeholder(goalId: string, stakeholderId: string, isAchiever: boolean) {

  // check if goal has collective goal
  const goalRef = db.doc(`Goals/${goalId}`)
  const goalSnap = await goalRef.get()
  const goal = createGoal(goalSnap.data())

  if (!goal.collectiveGoal.id) return; // No collective goal to update
  const collectiveGoalId = goal.collectiveGoal.id

  // add user as collective goal stakeholder
  const collectiveGoalStakeholderRef = db.doc(`CollectiveGoals/${collectiveGoalId}/CGStakeholders/${stakeholderId}`)
  const collectiveGoalStakeholderSnap = await collectiveGoalStakeholderRef.get()
    
  if (collectiveGoalStakeholderSnap.exists) {
    // set as achiever
    await collectiveGoalStakeholderRef.update({
      isAchiever: isAchiever
    })
    // note: collectiveGoalStakeholder is not deleted even if stakeholder does not have any rights anymore.
      
  } else {

    const profileRef = db.doc(`Users/${stakeholderId}/Profile/${stakeholderId}`)
    const profileSnap = await profileRef.get()
    const profile = profileSnap.data()
    if (!profile) return

    const collectiveGoalRef = db.doc(`CollectiveGoals/${collectiveGoalId}`)
    const collectiveGoalSnap = await collectiveGoalRef.get()
    const collectiveGoal = collectiveGoalSnap.data()
    if (!collectiveGoal) return

    // create new stakeholder
    const collectiveGoalStakeholder: CollectiveGoalStakeholder = createCollectiveGoalStakeholder({
      uid: stakeholderId,
      username: profile.username,
      photoURL: profile.image,
      isAchiever: isAchiever,
      isAdmin: false,
      isSpectator: false,
      collectiveGoalId: collectiveGoalId,
      collectiveGoalTitle: collectiveGoal.title,
      collectiveGoalIsPublic: collectiveGoal.isPublic,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    })

    await collectiveGoalRef.collection(`CGStakeholders`).doc(`${stakeholderId}`).create(collectiveGoalStakeholder)
  }
}
