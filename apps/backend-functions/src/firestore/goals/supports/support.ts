import { db, functions, admin, increment } from '../../../internals/firebase';
// Interaces
import { ISupport } from '@strive/interfaces';
import { handleNotificationsOfCreatedSupport, handleNotificationsOfChangedSupport, sendSupportDeletedNotification } from './support.notification'

export const supportCreatedHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
    .onCreate(async (snapshot, context) => {

        const support = Object.assign(<ISupport>{}, snapshot.data())
        const supportId = snapshot.id
        const goalId = context.params.goalId
        if (!support) return

        //Increase number of custom supports
        if (support.milestone && support.milestone.id !== null) { // Support for milestone added
            
            await increaseCustomSupportOfMilestone(goalId, support.milestone.id)
            await increaseCustomSupportOfGoal(goalId, false, true)

        } else { // Support for goal added

            await increaseCustomSupportOfGoal(goalId, true, true)

        }

        //Send notification to achievers of goal
        await handleNotificationsOfCreatedSupport(supportId, goalId, support)

    })

export const supportChangeHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
    .onUpdate(async (snapshot, context) =>  {

        const before: ISupport = Object.assign(<ISupport>{}, snapshot.before.data())
        const after: ISupport = Object.assign(<ISupport>{}, snapshot.after.data())
        if (!before) return
        if (!after) return

        const goalId = context.params.goalId
        const supportId = context.params.supportId

        // Send notification
        await handleNotificationsOfChangedSupport(supportId, goalId, before, after)

    })

export const supportDeletedHandler = functions.firestore.document(`Goals/{goalId}/Supports/{supportId}`)
    .onDelete(async (snapshot, context) => {

        const supportId = snapshot.id
        const goalId  = context.params.goalId
        const support: ISupport = Object.assign(<ISupport>{}, snapshot.data())

        await sendSupportDeletedNotification(goalId, supportId, support)

    })

async function increaseCustomSupportOfGoal(goalId: string, increaseNumberOfCustomSupports: boolean, increaseTotalNumberOfCustomSupports: boolean): Promise<void> {

    const goalRef: admin.firestore.DocumentReference = db.doc(`Goals/${goalId}`)

    if (increaseNumberOfCustomSupports && increaseTotalNumberOfCustomSupports) {

        await goalRef.update({
            numberOfCustomSupports: increment(1),
            totalNumberOfCustomSupports: increment(1)
        })

    } else if (!increaseNumberOfCustomSupports && increaseTotalNumberOfCustomSupports) {

        await goalRef.update({
            totalNumberOfCustomSupports: increment(1),
        })

    }

}

async function increaseCustomSupportOfMilestone(goalId: string, milestoneId: string): Promise<void> {

    const milestoneRef: admin.firestore.DocumentReference = db.doc(`Goals/${goalId}/Milestones/${milestoneId}`)

    await milestoneRef.update({
        numberOfCustomSupports: increment(1)
    })

}
