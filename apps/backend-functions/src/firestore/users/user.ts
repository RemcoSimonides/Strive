import { db, functions } from '../../internals/firebase';
import { logger } from 'firebase-functions';

import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia';
import { GoalStakeholder, createUser, User, createUserLink, Spectator } from '@strive/model';
import { updateAggregation } from '../../shared/aggregation/aggregation';

export const userCreatedHandler = functions.firestore.document(`Users/{uid}`)
  .onCreate(async (snapshot) => {

    const uid = snapshot.id
    const user = createUser({ ...snapshot.data(), uid: snapshot.id })

    // aggregation
    updateAggregation({ usersCreated: 1 })

    await addToAlgolia('user', uid, {
      uid,
      username: user.username,
      photoURL: user.photoURL,
      numberOfSpectators: user.numberOfSpectators
    })
  })

export const userDeletedHandler = functions.firestore.document(`Users/{uid}`)
  .onDelete(async (snapshot) => {

    const uid = snapshot.id
    await deleteFromAlgolia('user', uid)

    // aggregation
    updateAggregation({ usersDeleted: 1 })
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
        updateSpectators(uid, after),
        updateNotifications(uid, after),
        updateSupports(uid, after)

        // update every comment? No, rework data model for this

        // update notificaition support? Rework data model
        
        // Milestone achiever? No, rework data model for this
      ])
    }

    if (before.username !== after.username || before.photoURL !== after.photoURL || before.numberOfSpectators !== after.numberOfSpectators) {
      logger.log('updating Algolia')
      await updateAlgoliaObject('user', uid, {
        uid,
        username: after.username,
        photoURL: after.photoURL,
        numberOfSpectators: after.numberOfSpectators
      })
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

async function updateNotifications(uid: string, after: User) {
  // user notifications and goal notifications
  const snaps = await db.collectionGroup(`Notifications`).where('source.user.uid', '==', uid).get()
  logger.log(`User edited. Going to update ${snaps.size} notifications`)
  const batch = db.batch()
  snaps.forEach(snap => batch.update(snap.ref, {
    'source.user.username': after.username,
    'source.user.photoURL': after.photoURL
  }))
  batch.commit()
}

async function updateSupports(uid: string, after: User) {
  const [ receiver, supporter ] = await Promise.all([
    db.collectionGroup(`Supports`).where('receiver.uid', '==', uid).get(),
    db.collectionGroup(`Supports`).where('supporter.uid', '==', uid).get()
  ])

  const user = createUserLink(after)

  // !!! batch can update up to 500 documents. Should update per 500 docs
  const receiverBatch = db.batch()
  receiver.forEach(snap => receiverBatch.update(snap.ref, { receiver: user }))

  const supporterBatch = db.batch()
  supporter.forEach(snap => supporterBatch.update(snap.ref, { supporter: user }));

  receiverBatch.commit()
  supporterBatch.commit()
}