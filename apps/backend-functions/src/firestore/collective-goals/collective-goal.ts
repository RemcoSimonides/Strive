import { db, functions } from '../../internals/firebase';
import { enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface';
import { deleteScheduledTask, upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task';
import { deleteFromAlgolia, addToAlgolia, enumAlgoliaIndex, updateAlgoliaObject } from '../../shared/algolia/algolia';
import { deleteCollection } from '../../shared/delete-collections/delete-collections';
import { ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';

export const collectiveGoalCreatedHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}`)
    .onCreate(async (snapshot, context) => {

        const collectiveGoal: ICollectiveGoal = Object.assign(<ICollectiveGoal>{}, snapshot.data())
        const collectiveGoalId: string = snapshot.id

        if (!collectiveGoal) return

        if (collectiveGoal.isPublic) {

            await addToAlgolia(enumAlgoliaIndex.dev_CollectiveGoals, collectiveGoalId, {
                collectiveGoalId: collectiveGoalId,
                ...collectiveGoal
            })

        }

        if (collectiveGoal.deadline) {

            await upsertScheduledTask(collectiveGoalId, {
                worker: enumWorkerType.collectiveGoalDeadline,
                performAt: collectiveGoal.deadline,
                options: {
                    collectiveGoalId: collectiveGoalId
                }
            })
        }

    })

export const collectiveGoalDeletedHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}`)
    .onDelete(async (snapshot, context) => {

        const collectiveGoalId = snapshot.id

        try {
            await deleteFromAlgolia(enumAlgoliaIndex.dev_CollectiveGoals, collectiveGoalId)
        } catch (err) {
            console.log('deleting from Algolia error', err)
        }
        await deleteScheduledTask(collectiveGoalId)

        const promises: any[] = []
        
        //delete subcollections too
        promises.push(deleteCollection(db, `CollectiveGoals/${collectiveGoalId}/Templates`, 500))
        promises.push(deleteCollection(db, `CollectiveGoals/${collectiveGoalId}/InviteTokens`, 500))
        promises.push(deleteCollection(db, `CollectiveGoals/${collectiveGoalId}/CGStakeholders`, 500))
        promises.push(emptyCollectiveGoalDataOnGoals(collectiveGoalId))

        await Promise.all(promises)


    })

export const collectiveGoalChangeHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}`)
    .onUpdate(async (snapshot, context) => {

        const before: ICollectiveGoal = Object.assign(<ICollectiveGoal>{}, snapshot.before.data())
        const after: ICollectiveGoal = Object.assign(<ICollectiveGoal>{}, snapshot.after.data())
        if (!before) return
        if (!after) return

        const collectiveGoalId = context.params.collectiveGoalId

        // info updated
        if (before.title !== after.title ||
            before.isPublic !== after.isPublic ||
            before.image !== after.image) {

            await updateCollectiveGoalStakeholders(collectiveGoalId, after)
            await updateCollectiveGoalDataOnGoal(collectiveGoalId, after)

        }

        // public
        if (before.isPublic !== after.isPublic) {
            if (after.isPublic) {

                // add to algolia
                await addToAlgolia(enumAlgoliaIndex.dev_CollectiveGoals, collectiveGoalId, {
                    collectiveGoalId: collectiveGoalId,
                    ...after
                })

            } else {
                // delete goal from Algolia index
                await deleteFromAlgolia(enumAlgoliaIndex.dev_CollectiveGoals, collectiveGoalId)
            }
        } else if (before.title !== after.title ||
            before.image !== after.image ||
            before.shortDescription !== after.shortDescription) {

                await updateAlgoliaObject(enumAlgoliaIndex.dev_CollectiveGoals, collectiveGoalId, after)
        
        }

        // deadline
        if (before.deadline !== after.deadline) {
            if (!after.isOverdue) {
                await upsertScheduledTask(collectiveGoalId, {
                    worker: enumWorkerType.collectiveGoalDeadline,
                    performAt: after.deadline,
                    options: {
                        collectiveGoalId: collectiveGoalId
                    }
                })
            }
        }

    })

async function updateCollectiveGoalStakeholders(collectiveGoalId: string, after: FirebaseFirestore.DocumentData): Promise<void> {

    const stakeholdersColRef: FirebaseFirestore.CollectionReference = db.collection(`CollectiveGoals/${collectiveGoalId}/CGStakeholders`)
    const stakeholdersSnap: FirebaseFirestore.QuerySnapshot = await stakeholdersColRef.get()

    const promises: any[] = []
    stakeholdersSnap.forEach(stakeholderSnap => {

        const promise = stakeholderSnap.ref.update({
            collectiveGoalId: collectiveGoalId,
            collectiveGoalTitle: after.title,
            collectiveGoalIsPublic: after.isPublic,
            collectiveGoalImage: after.image
        })

        promises.push(promise)

    })

    await Promise.all(promises)

}

async function updateCollectiveGoalDataOnGoal(collectiveGoalId: string, after: FirebaseFirestore.DocumentData): Promise<void> {

    const goalsColRef: FirebaseFirestore.Query = db.collection(`Goals`).where('collectiveGoal.id', '==', collectiveGoalId)
    const goalsSnap: FirebaseFirestore.QuerySnapshot = await goalsColRef.get()
    
    const promises: any[] = []
    goalsSnap.forEach(goalSnap => {

        const promise = goalSnap.ref.update({
            collectiveGoal: {
                id: collectiveGoalId,
                image: after.image,
                isPublic: after.isPublic,
                title: after.title
            }
        })
        promises.push(promise)

    })

    await Promise.all(promises)

}

async function emptyCollectiveGoalDataOnGoals(collectiveGoalId: string): Promise<void> {

    const goalsColRef: FirebaseFirestore.Query = db.collection(`Goals`).where('collectiveGoal.id', '==', collectiveGoalId)
    const goalsColSnap: FirebaseFirestore.QuerySnapshot = await goalsColRef.get()
    if (!goalsColSnap) return
    
    const promises: any[] = []
    goalsColSnap.forEach(goalSnap => {
        
        const promise = goalSnap.ref.update({
            collectiveGoal: {
                id: null,
                title: null,
                isPublic: null
            }
        })
        promises.push(promise)

    });

    await Promise.all(promises)

}