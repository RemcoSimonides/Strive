import { db, admin, functions, increment } from '../../../internals/firebase';

// interfaces
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { ICollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';
import { handleNotificationsOfStakeholderCreated, handleNotificationsOfStakeholderChanged } from './goal-stakeholder.notification'


export const goalStakeholderCreatedHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
    .onCreate(async (snapshot, context) => {

        const stakeholder: GoalStakeholder = Object.assign(<GoalStakeholder>{}, snapshot.data())
        const goalId = context.params.goalId
        const stakeholderId = snapshot.id
        if (!stakeholder) return

        if (stakeholder.isAchiever) {
            await upsertCollectiveGoalStakeholder(goalId, stakeholderId, true)
            await changeNumberOfAchievers(goalId, stakeholder.isAchiever)
        }

        if (stakeholder.isSupporter) {
            await changeNumberOfSupporters(goalId, stakeholder.isSupporter)
        }

        // notifications
        await handleNotificationsOfStakeholderCreated(goalId, stakeholder)

    })

export const goalStakeholderChangeHandler = functions.firestore.document(`Goals/{goalId}/GStakeholders/{stakeholderId}`)
    .onUpdate(async (snapshot, context) => {

        const before: GoalStakeholder = Object.assign(<GoalStakeholder>{}, snapshot.before.data())
        const after: GoalStakeholder = Object.assign(<GoalStakeholder>{}, snapshot.after.data())
        const stakeholderId = context.params.stakeholderId
        if (!before) return
        if (!after) return

        const goalId = context.params.goalId

        // notifications
        await handleNotificationsOfStakeholderChanged(goalId, before, after)


        // isAchiever changed
        if (before.isAchiever !== after.isAchiever) {
            await changeNumberOfAchievers(goalId, after.isAchiever)
            await updateAchieverOnCollectiveGoal(goalId, stakeholderId, after.isAchiever)
        }

        //Increase or decrease number of Supporters
        if (before.isSupporter !== after.isSupporter) {
            await changeNumberOfSupporters(goalId, after.isSupporter)
        }

    })

async function changeNumberOfAchievers(goalId: string, isAchiever: boolean) {

    const goalRef: admin.firestore.DocumentReference = db.doc(`Goals/${goalId}`)
    await goalRef.update({
        numberOfAchievers: increment(isAchiever ? 1 : -1)
    })

}

async function changeNumberOfAchieversOfCollectiveGoal(collectiveGoalId: string, isAchiever: boolean): Promise<void> {

    const collectiveGoalRef: admin.firestore.DocumentReference = db.doc(`CollectiveGoals/${collectiveGoalId}`)
    
    await collectiveGoalRef.update({
        numberOfAchievers: increment(isAchiever ? 1 : -1)
    })

}

async function changeNumberOfSupporters(goalId: string, isSupporter: boolean): Promise<void> {

    const goalRef: admin.firestore.DocumentReference = db.doc(`Goals/${goalId}`)
    
    await goalRef.update({
        numberOfSupporters: increment(isSupporter ? 1 : -1)
    })

}

async function updateAchieverOnCollectiveGoal(goalId: string, stakeholderId: string, isAchiever: boolean): Promise<void> {

    const goalDocRef: admin.firestore.DocumentReference = db.doc(`Goals/${goalId}`)
    const goalDocSnap: admin.firestore.DocumentSnapshot = await goalDocRef.get()
    const goal: Goal = Object.assign(<Goal>{}, goalDocSnap.data())

    if (goal.collectiveGoal) {
        await upsertCollectiveGoalStakeholder(goalId, stakeholderId, isAchiever)
        await changeNumberOfAchieversOfCollectiveGoal(goal.collectiveGoal.id, isAchiever)
    }

}

async function upsertCollectiveGoalStakeholder(goalId: string, stakeholderId: string, isAchiever: boolean): Promise<void> {

    // check if goal has collective goal
    const goalRef: admin.firestore.DocumentReference = db.doc(`Goals/${goalId}`)
    const goalSnap: admin.firestore.DocumentSnapshot = await goalRef.get()
    const goal = goalSnap.data()
    if (!goal) return
    if (!goal.collectiveGoal) return // no collective goal to update
    const collectiveGoalId = goal.collectiveGoal.id

    // add user as collective goal stakeholder
    const collectiveGoalStakeholderRef: admin.firestore.DocumentReference = db.doc(`CollectiveGoals/${collectiveGoalId}/CGStakeholders/${stakeholderId}`)
    const collectiveGoalStakeholderSnap: admin.firestore.DocumentSnapshot = await collectiveGoalStakeholderRef.get()
    
    if (collectiveGoalStakeholderSnap.exists) {

        // set as achiever
        await collectiveGoalStakeholderRef.update({
            isAchiever: isAchiever
        })
        // note: collectiveGoalStakeholder is not deleted even if stakeholder does not have any rights anymore.
        
    } else {

        const profileRef: admin.firestore.DocumentReference = db.doc(`Users/${stakeholderId}/Profile/${stakeholderId}`)
        const profileSnap: admin.firestore.DocumentSnapshot = await profileRef.get()
        const profile = profileSnap.data()
        if (!profile) return

        const collectiveGoalRef: admin.firestore.DocumentReference = db.doc(`CollectiveGoals/${collectiveGoalId}`)
        const collectiveGoalSnap: admin.firestore.DocumentSnapshot = await collectiveGoalRef.get()
        const collectiveGoal = collectiveGoalSnap.data()
        if (!collectiveGoal) return

        // create new stakeholder
        const collectiveGoalStakeholder: ICollectiveGoalStakeholder = {
            uid: stakeholderId,
            username: profile.username,
            photoURL: profile.image,
            isAchiever: isAchiever,
            isAdmin: false,
            isSpectator: false,
            collectiveGoalId: collectiveGoalId,
            collectiveGoalTitle: collectiveGoal.title,
            collectiveGoalIsPublic: collectiveGoal.isPublic,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        }

        await collectiveGoalRef.collection(`CGStakeholders`).doc(`${stakeholderId}`).create(collectiveGoalStakeholder)

    }
}
