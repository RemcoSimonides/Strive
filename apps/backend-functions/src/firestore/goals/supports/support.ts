import { db, functions, admin, increment } from '../../../internals/firebase';
// Interaces
import { createSupport, Support } from '@strive/support/+state/support.firestore'
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { createGoal } from '@strive/model';
import { createGoalSource, createNotificationSource, enumEvent } from '@strive/notification/+state/notification.firestore';
import { addGoalEvent } from '../goal.events';
import { getDocument, toDate } from '../../../shared/utils';
import { Milestone } from '@strive/goal/milestone/+state/milestone.firestore';
import { sendNotificationToUsers } from 'apps/backend-functions/src/shared/notification/notification';
import { createNotification } from '@strive/notification/+state/notification.model';

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
    addGoalEvent(enumEvent.gSupportAdded, source)

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
        updatedAt: serverTimestamp() as any,
        createdAt: serverTimestamp() as any
      })

      stakeholderRef.set(goalStakeholder)
    }

    //Increase number of custom supports
    if (support.source.milestone?.id) { // Support for milestone added
      increaseCustomSupportOfMilestone(goalId, support.source.milestone.id)
      increaseCustomSupportOfGoal(goalId, false, true)
    } else { // Support for goal added
      increaseCustomSupportOfGoal(goalId, true, true)
    }
  })

export const supportChangeHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onUpdate(async snapshot =>  {

    const before = createSupport(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
    const after = createSupport(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))

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
        event: completedSuccessfully ? enumEvent.gSupportPendingSuccesful : enumEvent.gSupportPendingFailed,
        source
      })
      return sendNotificationToUsers(notification, supporter.uid)
    }

    if (!receiver?.uid) return
    if (supporter.uid === receiver.uid) return

    let event: enumEvent
    if (paid) event = enumEvent.gSupportPaid
    if (rejected) event = enumEvent.gSupportRejected
    if (waitingToBePaid) event = enumEvent.gSupportWaitingToBePaid

    if (event) {
      const notification = createNotification({ event, source })
      return sendNotificationToUsers(notification, receiver.uid, 'user')
    }
  })

export const supportDeletedHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onDelete(async snapshot => {
    
    const support = createSupport(toDate({ ...snapshot.data(), id: snapshot.id }))
    const source = getNotificationSource(support)

    const notification = createNotification({
      event: enumEvent.gSupportDeleted,
      source
    })
    sendNotificationToUsers(notification, support.source.supporter.uid)
  })

function increaseCustomSupportOfGoal(goalId: string, increaseNumberOfCustomSupports: boolean, increaseTotalNumberOfCustomSupports: boolean) {
  const ref = db.doc(`Goals/${goalId}`)

  if (increaseNumberOfCustomSupports && increaseTotalNumberOfCustomSupports) {
    return ref.update({
      numberOfCustomSupports: increment(1),
      totalNumberOfCustomSupports: increment(1)
    })

  } else if (!increaseNumberOfCustomSupports && increaseTotalNumberOfCustomSupports) {
    return ref.update({ totalNumberOfCustomSupports: increment(1) })
  }
}

function increaseCustomSupportOfMilestone(goalId: string, milestoneId: string) {
  const ref = db.doc(`Goals/${goalId}/Milestones/${milestoneId}`)
  return ref.update({ numberOfCustomSupports: increment(1) })
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