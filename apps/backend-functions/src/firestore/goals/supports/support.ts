import { db, functions, admin, increment } from '../../../internals/firebase';
// Interaces
import { createSupport, Support } from '@strive/support/+state/support.firestore'
import { handleNotificationsOfCreatedSupport, handleNotificationsOfChangedSupport, sendSupportDeletedNotification } from './support.notification'
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { createGoal } from '@strive/goal/goal/+state/goal.firestore';

export const supportCreatedHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onCreate(async (snapshot, context) => {

    const support = createSupport(snapshot.data())
    const supportId = snapshot.id
    const goalId = context.params.goalId

    //Set stakeholder as supporter
    const stakeholderRef = db.doc(`Goals/${goalId}/GStakeholders/${support.supporter.uid}`)
    const stakeholderSnap = await stakeholderRef.get()

    if (stakeholderSnap.exists) {
      // Update stakeholder
      const stakeholder = createGoalStakeholder(stakeholderSnap.data())
      if (!stakeholder.isSupporter) {
        stakeholderRef.update({ isSupporter: true })
      }
    } else {
      const goalSnap = await db.doc(`Goals/${goalId}`).get()
      const goal = createGoal(goalSnap.data())

      // create new stakeholder
      const goalStakeholder = createGoalStakeholder({
        uid: support.supporter.uid,
        username: support.supporter.username,
        photoURL: support.supporter.username,
        goalId: goalId,
        goalTitle: goal.title,
        goalImage: goal.image,
        goalPublicity: goal.publicity,
        isSupporter: true,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      })

      stakeholderRef.set(goalStakeholder)
    }

    //Increase number of custom supports
    if (!!support.milestone?.id) { // Support for milestone added
      increaseCustomSupportOfMilestone(goalId, support.milestone.id)
      increaseCustomSupportOfGoal(goalId, false, true)
    } else { // Support for goal added
      increaseCustomSupportOfGoal(goalId, true, true)
    }

    //Send notification to achievers of goal
    await handleNotificationsOfCreatedSupport(supportId, goalId, support)
  })

export const supportChangeHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onUpdate(async (snapshot, context) =>  {

    const before = createSupport(snapshot.before.data())
    const after = createSupport(snapshot.after.data())

    const goalId = context.params.goalId
    const supportId = context.params.supportId

    // Send notification
    handleNotificationsOfChangedSupport(supportId, goalId, before, after)
  })

export const supportDeletedHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
  .onDelete(async snapshot => {
    const support = createSupport(snapshot.data())
    sendSupportDeletedNotification(support)
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
