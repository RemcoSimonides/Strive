import { db, functions, increment } from '../../../internals/firebase';

// interfaces
import { createGoal } from '@strive/goal/goal/+state/goal.firestore'
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { handleNotificationsOfStakeholderCreated, handleNotificationsOfStakeholderChanged } from './goal-stakeholder.notification'


export const goalStakeholderCreatedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onCreate(async (snapshot, context) => {

    const stakeholder = createGoalStakeholder(snapshot.data())
    const goalId = context.params.goalId
    const stakeholderId = snapshot.id

    const goalSnap = await db.doc(`Goals/${goalId}`).get()
    const goal = createGoal({ ...goalSnap.data(), id: goalId })

    if (stakeholder.isAchiever) {
      changeNumberOfAchievers(goalId, stakeholder.isAchiever)
    }

    if (stakeholder.isSupporter) {
      changeNumberOfSupporters(goalId, stakeholder.isSupporter)
    }

    if (stakeholder.status === 'active') {
      changeNumberOfActiveGoals(stakeholder.uid, 1)
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

    const goalSnap = await db.doc(`Goals/${goalId}`).get()
    const goal = createGoal({ ...goalSnap.data(), id: goalId })

    // notifications
    handleNotificationsOfStakeholderChanged(goal, before, after)

    // isAchiever changed
    if (before.isAchiever !== after.isAchiever) {
      changeNumberOfAchievers(goalId, after.isAchiever)
    }

    //Increase or decrease number of Supporters
    if (before.isSupporter !== after.isSupporter) {
      changeNumberOfSupporters(goalId, after.isSupporter)
    }

    if (before.status !== after.status) {
      if (after.status === 'active') changeNumberOfActiveGoals(stakeholderId, 1)
      if (before.status === 'active') changeNumberOfActiveGoals(stakeholderId, -1)
    }

    if (before.status !== after.status && goal.status !== after.status) {

      if (after.status === 'bucketlist') {
        const snap = await db.collection(`Goals/${after.goalId}/GStakeholders`).where('status', '==', 'active').get()
        // keep goal status active if any stakeholder has status active
        if (snap.size) return
      }
      
      goalSnap.ref.update({ status: after.status });
    }
  })

export const goalStakeholderDeletedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onDelete(async (snapshot, context) => {

    const stakeholderId = context.params.stakeholderId
    const goal = createGoalStakeholder(snapshot.data())
    if (goal.status === 'active') {
      changeNumberOfActiveGoals(stakeholderId, -1)
    }

  })

function changeNumberOfAchievers(goalId: string, isAchiever: boolean) {
  const goalRef = db.doc(`Goals/${goalId}`)
  return goalRef.update({
    numberOfAchievers: increment(isAchiever ? 1 : -1)
  })
}

function changeNumberOfSupporters(goalId: string, isSupporter: boolean) {
  const goalRef = db.doc(`Goals/${goalId}`)
  return goalRef.update({
    numberOfSupporters: increment(isSupporter ? 1 : -1)
  })
}

function changeNumberOfActiveGoals(uid: string, delta: -1 | 1) {
  const userRef = db.doc(`Users/${uid}`)
  return userRef.update({
    numberOfActiveGoals: increment(delta)
  })
}
