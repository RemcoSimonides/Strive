import { db, functions } from '../../internals/firebase';
import { enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface';
import { deleteScheduledTask, upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task';
import { deleteFromAlgolia, addToAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia';
import { CollectiveGoal, createCollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { deleteCollection } from '../../shared/utils';

export const collectiveGoalCreatedHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}`)
  .onCreate(snapshot => {

    const collectiveGoal = createCollectiveGoal(snapshot.data())
    const collectiveGoalId = snapshot.id

    if (collectiveGoal.isPublic) {
      addToAlgolia('collectiveGoal', collectiveGoalId, {
        collectiveGoalId,
        ...collectiveGoal
      })
    }

    if (!!collectiveGoal.deadline) {
      upsertScheduledTask(collectiveGoalId, {
        worker: enumWorkerType.collectiveGoalDeadline,
        performAt: collectiveGoal.deadline,
        options: { collectiveGoalId }
      })
    }
  })

export const collectiveGoalDeletedHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}`)
  .onDelete(snapshot => {

    const collectiveGoalId = snapshot.id

    try {
      deleteFromAlgolia('collectiveGoal', collectiveGoalId)
    } catch (err) {
      console.log('deleting from Algolia error', err)
    }
    deleteScheduledTask(collectiveGoalId)

    const promises: any[] = []
        
    //delete subcollections too
    promises.push(deleteCollection(db, `CollectiveGoals/${collectiveGoalId}/Templates`, 500))
    promises.push(deleteCollection(db, `CollectiveGoals/${collectiveGoalId}/InviteTokens`, 500))
    promises.push(deleteCollection(db, `CollectiveGoals/${collectiveGoalId}/CGStakeholders`, 500))
    promises.push(emptyCollectiveGoalIdOnGoals(collectiveGoalId))

    return Promise.all(promises)
  })

export const collectiveGoalChangeHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}`)
  .onUpdate(async (snapshot, context) => {

    const before = createCollectiveGoal(snapshot.before.data())
    const after = createCollectiveGoal(snapshot.after.data())
    const collectiveGoalId = context.params.collectiveGoalId

    // update collective goal data in other collections
    if (before.title !== after.title
     || before.isPublic !== after.isPublic
     || before.image !== after.image) {
      updateCollectiveGoalStakeholders(collectiveGoalId, after)
    }

    // public
    if (before.isPublic !== after.isPublic) {
      if (after.isPublic) { // made public

        // add to algolia
        addToAlgolia('collectiveGoal', collectiveGoalId, {
          collectiveGoalId,
          ...after
        })

      } else { // made private

        // delete goal from Algolia index
        deleteFromAlgolia('collectiveGoal', collectiveGoalId)
      }
    } else if (before.title !== after.title 
      || before.image !== after.image 
      || before.shortDescription !== after.shortDescription) {
        updateAlgoliaObject('collectiveGoal', collectiveGoalId, after)
    }

    // deadline
    if (before.deadline !== after.deadline && !after.isOverdue) {
      upsertScheduledTask(collectiveGoalId, {
        worker: enumWorkerType.collectiveGoalDeadline,
        performAt: after.deadline,
        options: {
          collectiveGoalId: collectiveGoalId
        }
      })
    }
  })

async function updateCollectiveGoalStakeholders(collectiveGoalId: string, { title, isPublic, image }: CollectiveGoal) {

  const stakeholdersSnap = await db.collection(`CollectiveGoals/${collectiveGoalId}/CGStakeholders`).get()

  const promises: any[] = []
  stakeholdersSnap.forEach(stakeholderSnap => {
    const promise = stakeholderSnap.ref.update({
      collectiveGoalId,
      collectiveGoalTitle: title,
      collectiveGoalIsPublic: isPublic,
      collectiveGoalImage: image
    })
    promises.push(promise)
  })

  return Promise.all(promises)
}

async function emptyCollectiveGoalIdOnGoals(collectiveGoalId: string) {

  const goalsColSnap = await db.collection(`Goals`).where('collectiveGoal.id', '==', collectiveGoalId).get()
  if (!goalsColSnap) return
  
  const promises: any[] = []
  goalsColSnap.forEach(goalSnap => {
    const promise = goalSnap.ref.update({ collectiveGoalId: '' })
    promises.push(promise)
  });

  return Promise.all(promises)
}