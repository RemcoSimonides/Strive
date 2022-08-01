import { db, functions, increment, arrayUnion } from '../../../internals/firebase';

// interfaces
import { Goal } from '@strive/model'
import { createGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { toDate } from '../../../shared/utils';
import { getDocument } from 'apps/backend-functions/src/shared/utils';
import { addGoalEvent } from '../goal.events';
import { createGoalSource, enumEvent } from '@strive/notification/+state/notification.firestore';


export const goalStakeholderCreatedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onCreate(async (snapshot, context) => {

    const stakeholder = createGoalStakeholder(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { goalId } = context.params

    const goal = await getDocument<Goal>(`Goals/${goalId}`)

    if (stakeholder.isAchiever) {
      changeNumberOfAchievers(goalId, stakeholder.isAchiever)
    }

    if (stakeholder.isSupporter) {
      changeNumberOfSupporters(goalId, stakeholder.isSupporter)
    }

    if (stakeholder.status === 'active') {
      changeNumberOfActiveGoals(stakeholder.uid, 1)
    }

    // Adding admins and achievers to goal chat so they receive notifications
    if (stakeholder.isAdmin || stakeholder.isAchiever) {
      db.doc(`Discussions/${goal.id}`).update({
        commentators: arrayUnion(stakeholder.uid)
      })
    }

    // events
    handleStakeholderEvents(createGoalStakeholder(), stakeholder, goal)
  })

export const goalStakeholderChangeHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onUpdate(async (snapshot, context) => {

    const before = createGoalStakeholder(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
    const after = createGoalStakeholder(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))
    const { stakeholderId, goalId } = context.params

    const goal = await getDocument<Goal>(`Goals/${goalId}`)

    // events
    handleStakeholderEvents(before, after, goal)

    // isAchiever changed
    if (before.isAchiever !== after.isAchiever) {
      changeNumberOfAchievers(goalId, after.isAchiever)
    }

    // increase or decrease number of Supporters
    if (before.isSupporter !== after.isSupporter) {
      changeNumberOfSupporters(goalId, after.isSupporter)
    }

    // increase or decreate number of active goals
    if (before.status !== after.status) {
      if (after.status === 'active') changeNumberOfActiveGoals(stakeholderId, 1)
      if (before.status === 'active') changeNumberOfActiveGoals(stakeholderId, -1)
    }

    // Adding admins and achievers to goal chat so they receive notifications
    const becameAchiever = !before.isAchiever && after.isAchiever
    const becameAdmin = !before.isAdmin && after.isAdmin
    if (becameAchiever || becameAdmin) {
      db.doc(`Discussions/${goal.id}`).update({
        commentators: arrayUnion(after.uid)
      })
    }

    if (before.status !== after.status && goal.status !== after.status) {

      if (after.status === 'bucketlist') {
        const snap = await db.collection(`Goals/${after.goalId}/GStakeholders`).where('status', '==', 'active').get()
        // keep goal status active if any stakeholder has status active
        if (snap.size) return
      }
      
      db.doc(`Goals/${goalId}`).update({ status: after.status })
    }
  })

export const goalStakeholderDeletedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onDelete(async (snapshot, context) => {

    const stakeholderId = context.params.stakeholderId
    const stakeholder = createGoalStakeholder(toDate({ ...snapshot.data(), id: snapshot.id }))
    if (stakeholder.status === 'active') {
      changeNumberOfActiveGoals(stakeholderId, -1)
    }

  })

function handleStakeholderEvents(before: GoalStakeholder, after: GoalStakeholder, goal: Goal) {

  const becameAdmin = !before.isAdmin && after.isAdmin
  const becameAchiever = !before.isAchiever && after.isAchiever
  const becameSupporter = !before.isSupporter && after.isSupporter

  const adminRemoved = before.isAdmin && !after.isAdmin
  const achieverRemoved = before.isAchiever && !after.isAchiever
  const supporterRemoved = before.isSupporter && !after.isSupporter

  const requestToJoin = !before.hasOpenRequestToJoin && after.hasOpenRequestToJoin
  const requestToJoinDecided = before.hasOpenRequestToJoin && !after.hasOpenRequestToJoin
  const requestToJoinAccepted = requestToJoinDecided && !before.isAchiever && after.isAchiever
  const requestToJoinRejected = requestToJoinDecided && !before.isAchiever && !after.isAchiever

  const source = createGoalSource({
    goal,
    user: after
  })

  if (becameAdmin) addGoalEvent(enumEvent.gStakeholderAdminAdded, source)
  if (becameAchiever) addGoalEvent(enumEvent.gStakeholderAchieverAdded, source)
  if (becameSupporter) addGoalEvent(enumEvent.gStakeholderSupporterAdded, source)
  
  if (adminRemoved) addGoalEvent(enumEvent.gStakeholderAdminRemoved, source)
  if (achieverRemoved) addGoalEvent(enumEvent.gStakeholderAchieverRemoved, source)
  if (supporterRemoved) addGoalEvent(enumEvent.gStakeholderSupporterRemoved, source)

  if (requestToJoin) addGoalEvent(enumEvent.gStakeholderRequestToJoinPending, source)
  if (requestToJoinAccepted) addGoalEvent(enumEvent.gStakeholderRequestToJoinAccepted, source)
  if (requestToJoinRejected) addGoalEvent(enumEvent.gStakeholderRequestToJoinRejected, source)
}

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
