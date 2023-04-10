import { db, admin, onDocumentCreate, onDocumentUpdate, onDocumentDelete } from '@strive/api/firebase'
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
  Goal
} from '@strive/model'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { getDocument, toDate } from '../../../shared/utils'
import { sendNotificationToUsers } from '../../../shared/notification/notification'
import { updateAggregation } from '../../../shared/aggregation/aggregation'

const { serverTimestamp } = admin.firestore.FieldValue

export const supportCreatedHandler = onDocumentCreate(`Goals/{goalId}/Supports/{supportId}`, 'supportCreatedHandler',
async (snapshot, context) => {

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

    // Create new stakeholder
    const goalStakeholder = createGoalStakeholder({
      uid: support.supporterId,
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

export const supportChangeHandler = onDocumentUpdate(`Goals/{goalId}/Supports/{supportId}`, 'supportChangeHandler',
async snapshot =>  {

  const before = createSupportBase(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
  const after = createSupportBase(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))

  // aggregation
  handleAggregation(before, after)

  // events
  const needsDecision = !before.needsDecision && after.needsDecision
  const counterNeedsDecision = !before.counterNeedsDecision && after.counterNeedsDecision

  const rejected = before.status === 'open' && after.status === 'rejected'
  const accepted = before.status === 'open' && after.status === 'accepted'
  const counter_rejected = before.counterStatus === 'open' && after.counterStatus === 'rejected'
  const counter_accepted = before.counterStatus === 'open' && after.counterStatus === 'accepted'

  const { goalId, milestoneId, supporterId, recipientId } = after

  if (needsDecision || counterNeedsDecision) {
    let completedSuccessfully: boolean

    if (milestoneId) {
      const m = await getDocument<Milestone>(`Goals/${goalId}/Milestones/${milestoneId}`)
      completedSuccessfully = m.status === 'succeeded'
    } else {
      const g = await getDocument<Goal>(`Goals/${goalId}`)
      completedSuccessfully = g.status === 'succeeded'
    }

    const notification = createNotificationBase({
      event: '',
      goalId,
      milestoneId,
      supportId: after.id,
      userId: supporterId
    })

    if (counterNeedsDecision) {
      notification.event = 'goalSupportCounterStatusPendingUnsuccessful'
      return sendNotificationToUsers(notification, recipientId, 'user')
    } else {
      notification.event = completedSuccessfully ? 'goalSupportStatusPendingSuccessful' : 'goalSupportStatusPendingUnsuccessful'
      return sendNotificationToUsers(notification, supporterId, 'user')
    }
  }


  let event: EventType
  if (accepted) event = 'goalSupportStatusAccepted'
  if (rejected) event = 'goalSupportStatusRejected'
  if (counter_accepted) event = 'goalSupportStatusCounterAccepted'
  if (counter_rejected) event = 'goalSupportStatusCounterRejected'

  if (supporterId === recipientId) return
  if (event) {
    const from = counter_accepted || counter_rejected ? recipientId : supporterId
    const to = counter_accepted || counter_rejected ? supporterId : recipientId
    const notification = createNotificationBase({
      event,
      goalId,
      milestoneId,
      supportId: after.id,
      userId: from
    })
    return sendNotificationToUsers(notification, to, 'user')
  }
})

export const supportDeletedHandler = onDocumentDelete(`Goals/{goalId}/Supports/{supportId}`, 'supportDeletedHandler',
async (snapshot) => {

  const support = createSupportBase(toDate({ ...snapshot.data(), id: snapshot.id }))

  // aggregation
  handleAggregation(support, undefined)

  // delete notifications
  const { supporterId, recipientId } = support

  const batch = db.batch()

  const supportNotificationsColSnap = await db
    .collection(`Users/${supporterId}/Notifications`)
    .where('supportId', '==', support.id)
    .get()

  const recipientNotificationsColSnap = await db
    .collection(`Users/${recipientId}/Notifications`)
    .where('supportId', '==', support.id)
    .get()

  const paths = [
    ...supportNotificationsColSnap.docs.map(doc => doc.ref.path),
    ...recipientNotificationsColSnap.docs.map(doc => doc.ref.path)
  ]

  const noDuplicates = [...new Set(paths)]
  const refs = noDuplicates.map(path => db.doc(path))
  refs.forEach(ref => batch.delete(ref))

  await batch.commit()
})


function handleAggregation(before: undefined | SupportBase, after: undefined | SupportBase) {
  const aggregation = createAggregation()

  if (!before && !!after) aggregation.goalsCustomSupports++
  if (!!before && !after) aggregation.goalsCustomSupports--

  updateAggregation(aggregation)
}
