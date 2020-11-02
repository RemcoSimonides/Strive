import { db, functions } from '../../internals/firebase';

import { enumMilestoneStatus } from '@strive/interfaces';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
// Shared
import { upsertScheduledTask, deleteScheduledTask } from '../../shared/scheduled-task/scheduled-task';
import { enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface';
import { addToAlgolia, deleteFromAlgolia, enumAlgoliaIndex, updateAlgoliaObject } from '../../shared/algolia/algolia';
import { deleteCollection } from '../../shared/delete-collections/delete-collections';
import { handleNotificationsOfCreatedGoal, handleNotificationsOfChangedGoal } from './goal.notification';

export const goalCreatedHandler = functions.firestore.document(`Goals/{goalId}`)
    .onCreate(async (snapshot, context) => {

        const goal: Goal = Object.assign(<Goal>{}, snapshot.data())
        const goalId = snapshot.id
        if (!goal) return

        // algolia
        if (goal.publicity === 'public') {

            await addToAlgolia(enumAlgoliaIndex.dev_Goals, goalId, {
                goalId: goalId,
                ...goal
            })

        }

        // notifications
        await handleNotificationsOfCreatedGoal(goalId, goal)

        // deadline
        if (goal.deadline) {
            await upsertScheduledTask(goalId, {
                worker: enumWorkerType.goalDeadline,
                performAt: goal.deadline,
                options: {
                    goalId: goalId
                }
            })
        }

    })

export const goalDeletedHandler = functions.firestore.document(`Goals/{goalId}`)
    .onDelete(async (snapshot, context) => {

        const goalId = snapshot.id

        try {
            await deleteFromAlgolia(enumAlgoliaIndex.dev_Goals, goalId)
        } catch (err) {
            console.log('deleting from Algolia error', err)
        }
        await deleteScheduledTask(goalId)

        const promises: any[] = []
        
        //delete subcollections too
        promises.push(deleteCollection(db, `Goals/${goalId}/Milestones`, 500))
        promises.push(deleteCollection(db, `Goals/${goalId}/Supports`, 500))
        promises.push(deleteCollection(db, `Goals/${goalId}/Posts`, 500))
        promises.push(deleteCollection(db, `Goals/${goalId}/InviteTokens`, 500))
        promises.push(deleteCollection(db, `Goals/${goalId}/GStakeholders`, 500))

        await Promise.all(promises)

    })

export const goalChangeHandler = functions.firestore.document(`Goals/{goalId}`)
    .onUpdate(async (snapshot, context) => {

        const before: Goal = Object.assign(<Goal>{}, snapshot.before.data())
        const after: Goal = Object.assign(<Goal>{}, snapshot.after.data())
        if (!before) return
        if (!after) return

        const goalId = context.params.goalId

        // notifications
        await handleNotificationsOfChangedGoal(goalId, before, after)

        if (before.isFinished !== after.isFinished ||
            before.publicity !== after.publicity ||
            before.title !== after.title) {

            // change value on stakeholder docs
            await updateGoalStakeholders(goalId, after)
        }

        if (before.isFinished !== after.isFinished) {
            if (after.isFinished) {
                await handleUnfinishedMilestones(goalId)
            }
        }

        if (before.publicity !== after.publicity) {
            if (after.publicity === 'public') {
                // add to algolia
                await addToAlgolia(enumAlgoliaIndex.dev_Goals, goalId, {
                    goalId: goalId,
                    ...after
                })
            } else {
                // delete goal from Algolia index
                await deleteFromAlgolia(enumAlgoliaIndex.dev_Goals, goalId)
            }

        } else if (before.title !== after.title ||
            before.image !== after.image ||
            before.shortDescription !== after.shortDescription) {

                await updateAlgoliaObject(enumAlgoliaIndex.dev_Goals, goalId, after)
        }

        // deadline
        if (before.deadline !== after.deadline) {
            if (!after.isOverdue) {
                await upsertScheduledTask(goalId, {
                    worker: enumWorkerType.goalDeadline,
                    performAt: after.deadline ? after.deadline : '',
                    options: {
                        goalId: goalId
                    }
                })
            }
        }

    })

async function updateGoalStakeholders(goalId: string, after): Promise<void> {

    const stakeholdersColRef: FirebaseFirestore.CollectionReference = db.collection(`Goals/${goalId}/GStakeholders`)
    const stakeholdersSnap: FirebaseFirestore.QuerySnapshot = await stakeholdersColRef.get()
    
    const promises: any[] = []
    stakeholdersSnap.forEach(stakeholderSnap => {

        const promise = stakeholderSnap.ref.update({
            goalId: goalId,
            goalTitle: after.title,
            goalPublicity: after.publicity,
            goalIsFinished: after.isFinished
        })

        promises.push(promise)

    })

    await Promise.all(promises)

}

async function handleUnfinishedMilestones(goalId: string): Promise<void> {

    const milestonesRef = db.collection(`Goals/${goalId}/Milestones`).where('status', '==', enumMilestoneStatus.pending)
    const milestonesSnap = await milestonesRef.get()
    
    const promises: any[] = []
    milestonesSnap.forEach(milestoneSnap => {

        const promise = milestoneSnap.ref.update({
            status: enumMilestoneStatus.neutral
        })
        promises.push(promise)

    })

    await Promise.all(promises)

}
