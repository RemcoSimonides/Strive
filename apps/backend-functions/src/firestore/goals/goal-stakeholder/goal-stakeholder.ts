import { db, functions, increment } from '../../../internals/firebase';

// interfaces
import { Goal, createGoalStakeholder, GoalStakeholder, createGoalSource, createMilestone, createUserLink, createAggregation } from '@strive/model'
import { toDate } from '../../../shared/utils';
import { getDocument } from '../../../shared/utils';
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'
import { updateAggregation } from '../../../shared/aggregation/aggregation';


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

    if (stakeholder.isSpectator) {
      changeNumberOfSpectators(goalId, 1)
    }

    // events
    handleStakeholderEvents(createGoalStakeholder(), stakeholder, goal)

    // aggregation
    handleAggregation(undefined, stakeholder)
  })

export const goalStakeholderChangeHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onUpdate(async (snapshot, context) => {

    const before = createGoalStakeholder(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
    const after = createGoalStakeholder(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))
    const { stakeholderId, goalId } = context.params

    const goal = await getDocument<Goal>(`Goals/${goalId}`)

    // events
    handleStakeholderEvents(before, after, goal)

    // aggregation
    handleAggregation(before, after)

    // isAchiever changed
    if (before.isAchiever !== after.isAchiever) {
      changeNumberOfAchievers(goalId, after.isAchiever ? 1 : -1)
    }

    // increase or decrease number of Supporters
    if (before.isSupporter !== after.isSupporter) {
      changeNumberOfSupporters(goalId, after.isSupporter ? 1 : -1)
    }

    if (before.isSpectator !== after.isSpectator) {
      changeNumberOfSpectators(goalId, after.isSpectator ? 1 : -1)
    }
  })

export const goalStakeholderDeletedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
  .onDelete(async (snapshot, context) => {

    const { goalId, stakeholderId } = context.params
    const stakeholder = createGoalStakeholder(toDate({ ...snapshot.data(), id: snapshot.id }))

    // aggregation
    handleAggregation(stakeholder, undefined)

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

    if (stakeholder.isSpectator) {
      changeNumberOfSpectators(goalId, -1)
    }

  })

function handleStakeholderEvents(before: GoalStakeholder, after: GoalStakeholder, goal: Goal) {

  const becameAdmin = !before.isAdmin && after.isAdmin
  const becameAchiever = !before.isAchiever && after.isAchiever
  const becameSupporter = !before.isSupporter && after.isSupporter

  const requestToJoin = !before.hasOpenRequestToJoin && after.hasOpenRequestToJoin
  const requestToJoinDecided = before.hasOpenRequestToJoin && !after.hasOpenRequestToJoin
  const requestToJoinAccepted = requestToJoinDecided && !before.isAchiever && after.isAchiever
  const requestToJoinRejected = requestToJoinDecided && !before.isAchiever && !after.isAchiever

  const source = createGoalSource({
    goal,
    user: after
  })

  if (becameAdmin) {
    addGoalEvent('goalStakeholderBecameAdmin', source)
    if (goal.numberOfAchievers >= 1) addStoryItem('goalStakeholderBecameAdmin', source)
  }

  if (becameAchiever) {
    addGoalEvent('goalStakeholderBecameAchiever', source)
    if (goal.numberOfAchievers >= 1) addStoryItem('goalStakeholderBecameAchiever', source)
  }

  if (becameSupporter) addGoalEvent('goalStakeholderBecameSupporter', source)

  if (requestToJoin) addGoalEvent('goalStakeholderRequestedToJoin', source)
  if (requestToJoinAccepted) addGoalEvent('goalStakeholderRequestToJoinAccepted', source)
  if (requestToJoinRejected) addGoalEvent('goalStakeholderRequestToJoinRejected', source)
}

function handleAggregation(before: GoalStakeholder | undefined, after: GoalStakeholder | undefined) {
  const aggregation = createAggregation()

  const becameAdmin = !before?.isAdmin && after?.isAdmin
  const becameAchiever = !before?.isAchiever && after?.isAchiever
  const becameSupporter = !before?.isSupporter && after?.isSupporter

  const adminRemoved = before?.isAdmin && !after?.isAdmin
  const achieverRemoved = before?.isAchiever && !after?.isAchiever
  const supporterRemoved = before?.isSupporter && !after?.isSupporter

  aggregation.goalsAdmins = becameAdmin ? 1 : adminRemoved ? -1 : 0
  aggregation.goalsAchievers = becameAchiever ? 1 : achieverRemoved ? -1 : 0
  aggregation.goalsSupporters = becameSupporter ? 1 : supporterRemoved ? -1 : 0

  updateAggregation(aggregation)
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

function changeNumberOfSpectators(goalId: string, delta: -1 | 1) {
  const goalRef = db.doc(`Goals/${goalId}`)
  return goalRef.update({
    numberOfSpectators: increment(delta)
  })
}
