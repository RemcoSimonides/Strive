import { db, functions, admin, increment } from '../../../internals/firebase';
import {
  createGoal,
  createGoalStakeholder,
  Milestone,
  createGoalSource,
  createNotificationSource,
  EventType,
  createNotification,
  createSupport,
  Support,
  createAggregation,
  receiverIsUser,
  receiverIsGoal,
  createGoalEvent
} from '@strive/model'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { getDocument, toDate } from '../../../shared/utils'
import { sendGoalEventNotification, sendNotificationToUsers, SendOptions } from '../../../shared/notification/notification'
import { addStoryItem } from '../../../shared/goal-story/story'
import { updateAggregation } from '../../../shared/aggregation/aggregation';

const { serverTimestamp } = admin.firestore.FieldValue

export const supportCreatedHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onCreate(async (snapshot, context) => {

    const support = createSupport(toDate({ ...snapshot.data(), id: snapshot.id }))
    const goalId = context.params.goalId

    // events
    const source = createGoalSource({
      user: support.source.supporter,
      support,
      ...support.source
    })
    addGoalEvent('goalSupportCreated', source)
    addStoryItem('goalSupportCreated', source)

    // aggregation
    handleAggregation(undefined, support)

    // Set stakeholder as supporter
    const stakeholderRef = db.doc(`Goals/${goalId}/GStakeholders/${support.source.supporter.uid}`)
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
        uid: support.source.supporter.uid,
        username: support.source.supporter.username,
        photoURL: support.source.supporter.username,
        goalId,
        goalPublicity: goal.publicity,
        isSupporter: true,
        isSpectator: true,
        updatedAt: serverTimestamp() as any,
        createdAt: serverTimestamp() as any
      })

      stakeholderRef.set(goalStakeholder)
    }

    //Increase number of custom supports
    if (support.source.milestone?.id) { // Support for milestone added
      incrementCustomSupportOfMilestone(goalId, support.source.milestone.id, 1)
      incrementCustomSupportOfGoal(goalId, false, true, 1)
    } else { // Support for goal added
      incrementCustomSupportOfGoal(goalId, true, true, 1)
    }
  })

export const supportChangeHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onUpdate(async snapshot =>  {

    const before = createSupport(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
    const after = createSupport(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))

    // aggregation
    handleAggregation(before, after)

    // events
    const needsDecision = !before.needsDecision && after.needsDecision
    const paid = before.status !== 'paid' && after.status === 'paid'
    const rejected = before.status !== 'rejected' && after.status === 'rejected'
    const waitingToBePaid = before.status !== 'waiting_to_be_paid' && after.status === 'waiting_to_be_paid'
  
    const { goal, milestone, supporter, receiver } = after.source
    const source = getNotificationSource(after)
  
    if (needsDecision) {
      let completedSuccessfully: boolean
  
      if (milestone?.id) {
        const m = await getDocument<Milestone>(`Goals/${goal.id}/Milestones/${milestone.id}`)
        completedSuccessfully = m.status === 'succeeded'
      } else {
        // goals cant fail?
        completedSuccessfully = true
      }
  
      // send notification to supporter
      const notification = createNotification({
        event: completedSuccessfully ? 'goalSupportStatusPendingSuccessful' : 'goalSupportStatusPendingUnsuccessful',
        source
      })
      return sendNotificationToUsers(notification, supporter.uid)
    }

    if (!receiver) return

    let event: EventType
    if (paid) event = 'goalSupportStatusPaid'
    if (rejected) event = 'goalSupportStatusRejected'
    if (waitingToBePaid) event = 'goalSupportStatusWaitingToBePaid'

    if (event && receiverIsUser(receiver)) {
      if (supporter.uid === receiver.uid) return
      const notification = createNotification({ event, source })
      return sendNotificationToUsers(notification, receiver.uid, 'user')
    } else if (event && receiverIsGoal(receiver)) {
      const options: SendOptions = {
        send: {
          notification: true,
          pushNotification: true
        },
        roles: {
          isSupporter: true
        }
      }
      const goalEvent = createGoalEvent({
        name: event,
        source: createGoalSource({ ...source })
      })
      return sendGoalEventNotification(goalEvent, options, true)
    }
  })

export const supportDeletedHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onDelete(async (snapshot, context) => {

    const support = createSupport(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { goalId } = context.params

    //Decrease number of custom supports
    if (support.source.milestone?.id) { // Support for milestone added
      incrementCustomSupportOfMilestone(goalId, support.source.milestone.id, -1)
      incrementCustomSupportOfGoal(goalId, false, true, -1)
    } else { // Support for goal added
      incrementCustomSupportOfGoal(goalId, true, true, -1)
    }

    // aggregation
    handleAggregation(support, undefined)
  })


function handleAggregation(before: undefined | Support, after: undefined | Support) {
  const aggregation = createAggregation()

  if (!before && !!after) aggregation.goalsCustomSupports++
  if (!!before && !after) aggregation.goalsCustomSupports--

  updateAggregation(aggregation)
}

function incrementCustomSupportOfGoal(goalId: string, increaseNumberOfCustomSupports: boolean, increaseTotalNumberOfCustomSupports: boolean, delta: -1 | 1) {
  const ref = db.doc(`Goals/${goalId}`)

  if (increaseNumberOfCustomSupports && increaseTotalNumberOfCustomSupports) {
    return ref.update({
      numberOfCustomSupports: increment(delta),
      totalNumberOfCustomSupports: increment(delta)
    })

  } else if (!increaseNumberOfCustomSupports && increaseTotalNumberOfCustomSupports) {
    return ref.update({ totalNumberOfCustomSupports: increment(delta) })
  }
}

function incrementCustomSupportOfMilestone(goalId: string, milestoneId: string, delta: -1 | 1) {
  const ref = db.doc(`Goals/${goalId}/Milestones/${milestoneId}`)
  return ref.update({ numberOfCustomSupports: increment(delta) })
}

function getNotificationSource(support: Support) {
  const { goal, supporter, milestone } = support.source
  return createNotificationSource({
    goal,
    user: supporter,
    support,
    milestone
  })
}