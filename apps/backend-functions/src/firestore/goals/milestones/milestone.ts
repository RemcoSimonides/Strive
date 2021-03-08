import { db, functions } from '../../../internals/firebase';

//Interfaces
import { createMilestone } from '@strive/milestone/+state/milestone.firestore';

// Shared
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task';
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface';
import { handleStatusChangeNotification } from './milestone.notification';

export const milestoneCreatedhandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
    .onCreate(async (snapshot, context) => {

        const milestone = snapshot.data()
        const goalId = context.params.goalId
        const milestoneId = snapshot.id
        if (!milestone) return

        if (milestone.deadline) {
            await upsertScheduledTask(milestoneId, {
                worker: enumWorkerType.milestoneDeadline,
                performAt: milestone.deadline,
                options: {
                    goalId: goalId,
                    milestoneId: milestoneId
                }
            })
        }

    })

export const milestoneDeletedHandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
    .onDelete(async (snapshot, context) => {

        const milestoneId = snapshot.id
        const goalId = context.params.goalId

        await deleteScheduledTask(milestoneId)

        // delete supports
        // get supports
        const supportsColRef: FirebaseFirestore.Query = db.collection(`Goals/${goalId}/Supports`).where('milestone.id', '==', milestoneId)
        const supportssColSnap: FirebaseFirestore.QuerySnapshot = await supportsColRef.get()
        
        const promises: any[] = []
        supportssColSnap.docs.forEach(supportSnap => {
            const promise = db.doc(`Goals/${goalId}/Supports/${supportSnap.id}`).delete()
            promises.push(promise)
        })
        await Promise.all(promises);

        // send notification (not here but at support function)

    })

export const milestoneChangeHandler = functions.firestore.document(`Goals/{goalId}/Milestones/{milestoneId}`)
    .onUpdate(async (snapshot, context) => {

        const before = createMilestone(snapshot.before.data())
        const after = createMilestone(snapshot.after.data())
        const goalId = context.params.goalId
        const milestoneId = context.params.milestoneId

        if (!before) return
        if (!after) return

        // Do not do anything with milestones which just have been set to neutral
        if (before.status !== 'pending' && after.status === 'neutral') return

        //Milestone succeeded
        if (before.status !== after.status) { // Something has changed

            if (after.status !== 'neutral' && after.status !== 'overdue') await handleStatusChangeNotification(before, after, goalId, milestoneId)
            if (after.status !== 'pending' && after.status !== 'overdue') await handlePotentialSubmilestones(after, goalId)

        }

        if (before.deadline !== after.deadline) {

            await upsertScheduledTask(milestoneId, {
                worker: enumWorkerType.milestoneDeadline,
                performAt: after.deadline,
                options: {
                    goalId: goalId,
                    milestoneId: milestoneId
                }
            })

        }

    })

async function handlePotentialSubmilestones(milestone: any, goalId: string): Promise<void> {

    // level 3 milestone doesn't have submilestones
    if ((milestone.sequenceNumber.match(/\./g) || []).length === 3 ) return

    const oneSeqnoHigher: string = _increaseSeqnoByOne(milestone.sequenceNumber)

    // get all submilestones
    const subMilestonesColRef = db.collection(`Goals/${goalId}/Milestones`)
        .where('status', '==', 'pending')
        .where('sequenceNumber', '>', milestone.sequenceNumber)
        .where('sequenceNumber', '<', oneSeqnoHigher)
    const subMilestonesColSnap = await subMilestonesColRef.get()

    const promises: any[] = []
    subMilestonesColSnap.forEach(subMilestoneSnap => {

        const promise = subMilestoneSnap.ref.update({
            status: 'neutral'
        })
        promises.push(promise)

    })

    await Promise.all(promises)

}

export function _increaseSeqnoByOne(seqno: string): string {

    const lastLetter: string = seqno.substr(seqno.length - 1, 1)
    const lastNumberPlusOne: number = +lastLetter + 1
    const seqnoMinusLast: string = seqno.substr(0, seqno.length - 1)
    const oneSeqnoHigher: string = seqnoMinusLast + lastNumberPlusOne.toString()

    return oneSeqnoHigher    

}