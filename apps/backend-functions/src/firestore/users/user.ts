import { db, functions, gcsBucket, auth } from '../../internals/firebase'
import { logger } from 'firebase-functions'

import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia'
import { GoalStakeholder, createUser, User, createUserLink, Spectator, createAlgoliaUser } from '@strive/model'
import { updateAggregation } from '../../shared/aggregation/aggregation'
import { deleteCollection, toDate } from '../../shared/utils'

export const userCreatedHandler = functions.firestore.document(`Users/{uid}`)
  .onCreate(async (snapshot) => {

    const uid = snapshot.id
    const user = createUser({ ...snapshot.data(), uid: snapshot.id })

    // aggregation
    updateAggregation({ usersCreated: 1 })

    await addToAlgolia('user', uid, createAlgoliaUser(user))
  })

export const userDeletedHandler = functions.firestore.document(`Users/{uid}`)
  .onDelete(async (snapshot) => {

    const uid = snapshot.id
    const user = createUser(toDate({ ...snapshot.data(), id: snapshot.id }))
    await deleteFromAlgolia('user', uid)

    // aggregation
    updateAggregation({ usersDeleted: 1 })

    const stakeholderBatch = db.batch()
    const stakeholdersSnap = await db.collectionGroup(`GStakeholders`).where('uid', '==', uid).get()
    stakeholdersSnap.forEach(snap => stakeholderBatch.delete(snap.ref))
    stakeholderBatch.commit()

    const spectatingBatch = db.batch()
    const spectatingsSnap = await db.collectionGroup(`Spectators`).where('uid', '==', uid).get()
    spectatingsSnap.forEach(snap => spectatingBatch.delete(snap.ref))
    spectatingBatch.commit()

    const supportBatch = db.batch()
    const supportsSnap = await db.collectionGroup('Supports').where('supporterId', '==', uid).get()
    supportsSnap.forEach(snap => supportBatch.delete(snap.ref))
    supportBatch.commit()

    // also delete subcollections
    deleteCollection(db, `Users/${uid}/Personal`, 500)
    deleteCollection(db, `Users/${uid}/Notifications`, 500)
    deleteCollection(db, `Users/${uid}/Spectators`, 500)
    deleteCollection(db, `Users/${uid}/Exercises`, 500)

    if (user.photoURL) {
      gcsBucket.file(user.photoURL).delete({ ignoreNotFound: true })
    }

    auth.deleteUser(uid)
  })

export const userChangeHandler = functions.firestore.document(`Users/{uid}`)
  .onUpdate(async (snapshot, context) => {

    const uid = context.params.uid
    const before = createUser({ ...snapshot.before.data(), uid: snapshot.before.id })
    const after = createUser({ ...snapshot.after.data(), uid: snapshot.after.id })


    if (before.username !== after.username || before.photoURL !== after.photoURL) {
      if (!after.username || !after.photoURL) {
        // TODO prevent this with firestore rules
        logger.error('SOMETHING WENT WRONG BEFORE THIS - WHAT DID YOU DO?: ', before, after)
        return
      }

      await Promise.all([
        updateGoalStakeholders(uid, after), 
        updateSpectators(uid, after)
      ])
    }

    if (before.username !== after.username || before.photoURL !== after.photoURL || before.numberOfSpectators !== after.numberOfSpectators) {
      logger.log('updating Algolia')
      await updateAlgoliaObject('user', uid, createAlgoliaUser(after))
    }
  })

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
