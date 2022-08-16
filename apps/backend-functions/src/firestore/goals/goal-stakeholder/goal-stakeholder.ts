import { db, functions, increment, arrayUnion } from '../../../internals/firebase';

// interfaces
import { Goal, createGoalStakeholder, GoalStakeholder, createGoalSource, enumEvent, createMilestone, createUserLink, createSupport } from '@strive/model'
import { toDate } from '../../../shared/utils';
import { getDocument } from '../../../shared/utils';
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'


export const goalStakeholderCreatedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onCreate(async (snapshot, context) => {

    const stakeholder = createGoalStakeholder(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { goalId } = context.params

    const goal = await getDocument<Goal>(`Goals/${goalId}`)

    if (stakeholder.isAchiever) {
      changeNumberOfAchievers(goalId, 1)
    }

    if (stakeholder.isSupporter) {
      changeNumberOfSupporters(goalId, 1)
    }

    if (stakeholder.status === 'active') {
      changeNumberOfActiveGoals(stakeholder.uid, 1)
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
      changeNumberOfAchievers(goalId, after.isAchiever ? 1 : -1)
    }

    // increase or decrease number of Supporters
    if (before.isSupporter !== after.isSupporter) {
      changeNumberOfSupporters(goalId, after.isSupporter ? 1 : -1)
    }

    // increase or decreate number of active goals
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
      
      db.doc(`Goals/${goalId}`).update({ status: after.status })
    }
  })

export const goalStakeholderDeletedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onDelete(async (snapshot, context) => {

    const { goalId, stakeholderId } = context.params
    const stakeholder = createGoalStakeholder(toDate({ ...snapshot.data(), id: snapshot.id }))

    if (stakeholder.isAchiever) {
      changeNumberOfAchievers(goalId, -1)

      const snaps = await db.collection(`Goals/${goalId}/Milestones`).where('achiever.uid', '==', stakeholder.uid).get()
      const batch = db.batch()
      for (const doc of snaps.docs) {
        const milestone = createMilestone(doc.data())
        milestone.achiever = createUserLink()
        batch.update(doc.ref, { ...milestone })
      }
      batch.commit()
    }

    if (stakeholder.isSupporter) {
      changeNumberOfSupporters(goalId, -1)

      const snaps = await db.collection(`Goals/${goalId}/Supports`).where('source.supporter.uid', '==', stakeholder.uid).get()
      const batch = db.batch()
      for (const doc of snaps.docs) {
        batch.delete(doc.ref)
      }
      batch.commit()
    }

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

  if (becameAdmin) {
    addGoalEvent(enumEvent.gStakeholderAdminAdded, source)
    if (goal.numberOfAchievers >= 1) addStoryItem(enumEvent.gStakeholderAdminAdded, source)
  }

  if (becameAchiever) {
    addGoalEvent(enumEvent.gStakeholderAchieverAdded, source)
    if (goal.numberOfAchievers >= 1) addStoryItem(enumEvent.gStakeholderAchieverAdded, source)
  }

  if (becameSupporter) addGoalEvent(enumEvent.gStakeholderSupporterAdded, source)
  
  if (adminRemoved) addGoalEvent(enumEvent.gStakeholderAdminRemoved, source)
  if (achieverRemoved) addGoalEvent(enumEvent.gStakeholderAchieverRemoved, source)
  if (supporterRemoved) addGoalEvent(enumEvent.gStakeholderSupporterRemoved, source)

  if (requestToJoin) addGoalEvent(enumEvent.gStakeholderRequestToJoinPending, source)
  if (requestToJoinAccepted) addGoalEvent(enumEvent.gStakeholderRequestToJoinAccepted, source)
  if (requestToJoinRejected) addGoalEvent(enumEvent.gStakeholderRequestToJoinRejected, source)
}

function changeNumberOfAchievers(goalId: string, delta: -1 | 1) {
  const goalRef = db.doc(`Goals/${goalId}`)
  return goalRef.update({
    numberOfAchievers: increment(delta)
  })
}

function changeNumberOfSupporters(goalId: string, delta: -1 | 1) {
  const goalRef = db.doc(`Goals/${goalId}`)
  return goalRef.update({
    numberOfSupporters: increment(delta)
  })
}

function changeNumberOfActiveGoals(uid: string, delta: -1 | 1) {
  const userRef = db.doc(`Users/${uid}`)
  return userRef.update({
    numberOfActiveGoals: increment(delta)
  })
}
