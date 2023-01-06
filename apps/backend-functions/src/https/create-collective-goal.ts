import { db, functions, serverTimestamp, gcsBucket } from '../internals/firebase'
import { ErrorResultResponse } from '../shared/utils'
import { wrapHttpsOnCallHandler } from '../internals/sentry'
import { createGoal, createGoalStakeholder, Goal, GoalStakeholder } from '@strive/model'

export const createCollectiveGoal = functions().https.onCall(wrapHttpsOnCallHandler('createCollectiveGoal',
async (data: { goal: Goal, stakeholder: GoalStakeholder }): Promise<ErrorResultResponse> => {

  const { goal, stakeholder } = data
  const collectiveGoalId = goal.collectiveGoalId ? goal.collectiveGoalId : goal.id
  const batch = db.batch()

  if (!goal.collectiveGoalId) {
    const ref = db.doc(`Goals/${goal.id}`)
    batch.update(ref, { collectiveGoalId })

    const stakeholdersSnap = await ref.collection(`GStakeholders`).get()
    for (const doc of stakeholdersSnap.docs) {
      batch.update(doc.ref, { collectiveGoalId })
    }
  }

  const goalId = db.collection('abc').doc().id
  const goalRef = db.doc(`Goals/${goalId}`)
  const stakeholderRef = goalRef.collection(`GStakeholders`).doc(stakeholder.uid)

  // copy image
  let image = ''
  if (goal.image) {
    const file = gcsBucket.file(goal.image)
    const name = goal.image.split('/').pop()
    image = `goals/${goalId}/${name}`
    await file.copy(image)
  }

  const newGoal = createGoal({
    title: goal.title,
    deadline: new Date(goal.deadline),
    description: goal.description,
    image,
    publicity: goal.publicity,
    collectiveGoalId,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    updatedBy: stakeholder.uid
  })

  const newStakeholder = createGoalStakeholder({
    uid: stakeholder.uid,
    goalId,
    goalPublicity: goal.publicity,
    collectiveGoalId,
    isAdmin: true,
    isAchiever: true,
    isSpectator: true,
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
    updatedBy: stakeholder.uid
  })

  batch.set(goalRef, newGoal)
  batch.set(stakeholderRef, newStakeholder)
  await batch.commit()

  return {
    error: '',
    result: goalId
  }
}))