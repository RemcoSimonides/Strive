import { db, functions, admin } from '../../internals/firebase';
import { logger } from 'firebase-functions';

import { createUser, User } from '@strive/user/user/+state/user.firestore';
import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia';
import { CollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';
import { Spectator } from '@strive/user/spectator/+state/spectator.firestore';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';

export const userCreatedHandler = functions.firestore.document(`Users/{uid}`)
  .onCreate(async (snapshot, context) => {

    const uid = snapshot.id
    const user = createUser({ ...snapshot.data(), uid: snapshot.id })

    addToAlgolia('user', uid, {
      uid,
      username: user.username,
      photoURL: user.photoURL,
      numberOfSpectators: user.numberOfSpectators
    })
  })

export const userDeletedHandler = functions.firestore.document(`Users/{uid}`)
  .onDelete(async (snapshot, context) => {

    const uid = snapshot.id
    deleteFromAlgolia('user', uid)

  })

export const userChangeHandler = functions.firestore.document(`Users/{uid}`)
  .onUpdate(async (snapshot, context) => {

    const uid = context.params.uid
    const before = createUser({ ...snapshot.before.data(), uid: snapshot.before.id })
    const after = createUser({ ...snapshot.after.data(), uid: snapshot.after.id })

    logger.log('updating Algolia')
    updateAlgoliaObject('user', uid, {
      uid,
      username: after.username,
      photoURL: after.photoURL,
      numberOfSpectators: after.numberOfSpectators
    })

    if (before.username !== after.username || before.photoURL !== after.photoURL) {
              
      if (!after.username || !after.photoURL) {
        // TODO prevent this with firestore rules
        logger.log('SOMETHING WENT WRONG BEFORE THIS - WHAT DID YOU DO?')
        return
      }

      await Promise.all([
        updateGoalStakeholders(uid, after), 
        updateSpectators(uid, after),
        updateCollectiveGoalStakeholders(uid, after)
      ])
    }
  })

async function updateCollectiveGoalStakeholders(uid: string, after: User) {
  const data: Partial<CollectiveGoalStakeholder> = {
    username: after.username,
    photoURL: after.photoURL
  }

  const stakeholdersSnap = await db.collectionGroup(`CGStakeholders`).where('uid', '==', uid).get()
  const promises = stakeholdersSnap.docs.map(doc => doc.ref.update(data))
  return Promise.all(promises)
}

async function updateGoalStakeholders(uid: string, after: User) {
  const data: Partial<GoalStakeholder> = {
    username: after.username,
    photoURL: after.photoURL
  }

  const stakeholdersSnap = await db.collectionGroup(`GStakeholders`).where('uid', '==', uid).get()
  const promises = stakeholdersSnap.docs.map(doc => doc.ref.update(data))
  return Promise.all(promises)
}

async function updateSpectators(uid: string, after: User) {
  logger.log('uid: ', uid);
  const spectating: Partial<Spectator> = {
    username: after.username,
    photoURL: after.photoURL
  }

  const spectator: Partial<Spectator> = {
    profileUsername: after.username,
    profilePhotoURL: after.photoURL
  }

  const spectatingsSnap = await db.collectionGroup(`Spectators`).where('uid', '==', uid).get()
  const promises = spectatingsSnap.docs.map(doc => doc.ref.update(spectating))
  
  const spectatorsSnap = await db.collection(`Users/${uid}/Spectators`).get()
  for (const doc of spectatorsSnap.docs) {
    const promise = doc.ref.update(spectator)
    promises.push(promise)
  }

  return Promise.all(promises)
}