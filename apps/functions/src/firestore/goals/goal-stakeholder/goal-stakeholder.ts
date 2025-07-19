import { db, getRef, increment, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'

import { Goal, createGoalStakeholder, GoalStakeholder, createGoalSource, createAggregation, createNotificationBase } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { getDocument } from '../../../shared/utils'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'
import { updateAggregation } from '../../../shared/aggregation/aggregation'
import { sendNotificationToUsers } from '../../../shared/notification/notification'


export const goalStakeholderCreatedHandler = onDocumentCreate(`Goals/{goalId}/GStakeholders/{stakeholderId}`,
async (snapshot) => {

  const stakeholder = createGoalStakeholder(toDate({ ...snapshot.data.data(), id: snapshot.id }))
  const { goalId } = snapshot.params

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

export const goalStakeholderChangeHandler = onDocumentUpdate(`Goals/{goalId}/GStakeholders/{stakeholderId}`,
async (snapshot) => {

  const before = createGoalStakeholder(toDate({ ...snapshot.data.before.data(), id: snapshot.id }))
  const after = createGoalStakeholder(toDate({ ...snapshot.data.after.data(), id: snapshot.id }))
  const { goalId, stakeholderId } = snapshot.params

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

  if (!after.isAdmin && !after.isAchiever && !after.isSupporter && !after.isSpectator && !after.hasOpenRequestToJoin && !after.hasInviteToJoin) {
    const ref = getRef(`Goals/${goalId}/GStakeholders/${stakeholderId}`)
    ref.delete()
  }
})

export const goalStakeholderDeletedHandler = onDocumentDelete(`Goals/{goalId}/GStakeholders/{stakeholderId}`,
async (snapshot) => {

  const { goalId } = snapshot.params
  const stakeholder = createGoalStakeholder(toDate({ ...snapshot.data.data(), id: snapshot.id }))

  // aggregation
  handleAggregation(stakeholder, undefined)

  const goalStakeholdersSnap = await db.collection(`Goals/${goalId}/GStakeholders`).get()
  if (goalStakeholdersSnap.size === 0) {
    return db.doc(`Goals/${goalId}`).delete()
  }

  const goalSnap = await db.doc(`Goals/${goalId}`).get()
  if (!goalSnap.exists) return

  if (stakeholder.isAchiever) {
    changeNumberOfAchievers(goalId, -1)

    const snaps = await db.collection(`Goals/${goalId}/Milestones`).where('achieverId', '==', stakeholder.uid).get()
    const batch = db.batch()
    for (const doc of snaps.docs) {
      batch.update(doc.ref, { achieverId: '' })
    }
    batch.commit()
  }

  if (stakeholder.isSupporter) {
    changeNumberOfSupporters(goalId, -1)

    const snaps = await db.collection(`Goals/${goalId}/Supports`).where('supporterId', '==', stakeholder.uid).get()
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
  const requestToJoinRejected = requestToJoinDecided && !before.isAchiever && !after.isAchiever && after.updatedBy !== after.uid

  const invitedToJoin = !before.hasInviteToJoin && after.hasInviteToJoin

  const source = createGoalSource({
    goalId: after.goalId,
    userId: after.uid
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

  if (invitedToJoin) {
    const notification = createNotificationBase({
      goalId: after.goalId,
      userId: after.updatedBy,
      event: 'goalStakeholderInvitedToJoin'
    })
    sendNotificationToUsers(notification, after.uid, 'user')
  }
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
