import { db, functions, admin } from '../../../internals/firebase'
import {
  createGoal,
  createGoalStakeholder,
  Milestone,
  createGoalSource,
  EventType,
  createNotificationBase,
  createSupportBase,
  SupportBase,
  createAggregation,
  User
} from '@strive/model'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { getDocument, toDate } from '../../../shared/utils'
import { sendNotificationToUsers } from '../../../shared/notification/notification'
import { updateAggregation } from '../../../shared/aggregation/aggregation'

const { serverTimestamp } = admin.firestore.FieldValue

export const supportCreatedHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onCreate(async (snapshot, context) => {

    const support = createSupportBase(toDate({ ...snapshot.data(), id: snapshot.id }))
    const goalId = context.params.goalId

    // events
    const source = createGoalSource({
      goalId,
      userId: support.supporterId,
      milestoneId: support.milestoneId,
      supportId: support.id
    })
    addGoalEvent('goalSupportCreated', source)

    // aggregation
    handleAggregation(undefined, support)

    // Set stakeholder as supporter
    const stakeholderRef = db.doc(`Goals/${goalId}/GStakeholders/${support.supporterId}`)
    const stakeholderSnap = await stakeholderRef.get()

    if (stakeholderSnap.exists) {
      // Update stakeholder
      const stakeholder = createGoalStakeholder(toDate(stakeholderSnap.data()))
      if (!stakeholder.isSupporter) {
        stakeholderRef.update({ isSupporter: true })
      }
    } else {
      const goalSnap = await db.doc(`Goals/${goalId}`).get()
      const goal = createGoal(goalSnap.data())
      const user = await getDocument<User>(`Users/${support.supporterId}`)

      // Create new stakeholder
      const goalStakeholder = createGoalStakeholder({
        uid: support.supporterId,
        username: user.username,
        photoURL: user.photoURL,
        goalId,
        goalPublicity: goal.publicity,
        isSupporter: true,
        isSpectator: true,
        updatedAt: serverTimestamp() as any,
        createdAt: serverTimestamp() as any
      })

      stakeholderRef.set(goalStakeholder)
    }

  })

export const supportChangeHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onUpdate(async snapshot =>  {

    const before = createSupportBase(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
    const after = createSupportBase(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))

    // aggregation
    handleAggregation(before, after)

    // events
    const needsDecision = !before.needsDecision && after.needsDecision
    const paid = before.status !== 'paid' && after.status === 'paid'
    const rejected = before.status !== 'rejected' && after.status === 'rejected'
    const waitingToBePaid = before.status !== 'waiting_to_be_paid' && after.status === 'waiting_to_be_paid'
  
    const { goalId, milestoneId, supporterId, recipientId } = after
  
    if (needsDecision) {
      let completedSuccessfully: boolean
  
      if (milestoneId) {
        const m = await getDocument<Milestone>(`Goals/${goalId}/Milestones/${milestoneId}`)
        completedSuccessfully = m.status === 'succeeded'
      } else {
        // goals cant fail?
        completedSuccessfully = true
      }
  
      // send notification to supporter
      const notification = createNotificationBase({
        event: completedSuccessfully ? 'goalSupportStatusPendingSuccessful' : 'goalSupportStatusPendingUnsuccessful',
        goalId,
        milestoneId,
        supportId: after.id,
        userId: supporterId
      })
      return sendNotificationToUsers(notification, supporterId)
    }


    let event: EventType
    if (paid) event = 'goalSupportStatusPaid'
    if (rejected) event = 'goalSupportStatusRejected'
    if (waitingToBePaid) event = 'goalSupportStatusWaitingToBePaid'

    if (!recipientId) return
    if (supporterId === recipientId) return
    if (event) {
      const notification = createNotificationBase({
        event,
        goalId,
        milestoneId,
        supportId: after.id,
        userId: supporterId
      })
      return sendNotificationToUsers(notification, recipientId, 'user')
    }
  })

export const supportDeletedHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onDelete(async (snapshot, context) => {

    const support = createSupportBase(toDate({ ...snapshot.data(), id: snapshot.id }))

    // aggregation
    handleAggregation(support, undefined)
  })


function handleAggregation(before: undefined | SupportBase, after: undefined | SupportBase) {
  const aggregation = createAggregation()

  if (!before && !!after) aggregation.goalsCustomSupports++
  if (!!before && !after) aggregation.goalsCustomSupports--

  updateAggregation(aggregation)
}
