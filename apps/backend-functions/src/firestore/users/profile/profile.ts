import { db, functions, admin } from '../../../internals/firebase';

import { Profile } from '@strive/user/user/+state/user.firestore';
import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../../shared/algolia/algolia';
import { CollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';
import { Spectator } from '@strive/user/spectator/+state/spectator.firestore';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';

export const profileCreatedHandler = functions.firestore.document(`Users/{userId}/Profile/{uid}`)
  .onCreate(async (snapshot, context) => {

    const uid = snapshot.id
    const profile = snapshot.data() as Profile

    addToAlgolia('user', uid, {
      uid,
      username: profile.username,
      photoURL: profile.photoURL,
      numberOfSpectators: profile.numberOfSpectators
    })
  })

export const profileDeletedHandler = functions.firestore.document(`Users/{userId}/Profile/{uid}`)
  .onDelete(async (snapshot, context) => {

    const uid = snapshot.id
    deleteFromAlgolia('user', uid)

  })

export const profileChangeHandler = functions.firestore.document(`Users/{userId}/Profile/{uid}`)
  .onUpdate(async (snapshot, context) => {

    const before = snapshot.before.data() as Profile
    const after = snapshot.after.data() as Profile
    const uid = context.params.userId

    if (before.fcmTokens.length < after.fcmTokens.length) {
      admin.messaging().subscribeToTopic(after.fcmTokens, 'notifications')
        .then(res => { console.log('Successfully subscribed to topic:', res) })
        .catch(err => { console.log('Error subscribing tot topic', err) })
    }

    console.log('updating Algolia')
    updateAlgoliaObject('user', uid, {
      uid,
      username: after.username,
      photoURL: after.photoURL,
      numberOfSpectators: after.numberOfSpectators
    })

    if (before.username !== after.username || before.photoURL !== after.photoURL) {
              
      if (!after.username || !after.photoURL) {
        // TODO prevent this with firestore rules
        console.log('SOMETHING WENT WRONG BEFORE THIS - WHAT DID YOU DO?')
        return
      }

      await Promise.all([
        updateGoalStakeholders(uid, after), 
        updateSpectators(uid, after),
        updateCollectiveGoalStakeholders(uid, after)
      ])
    }
  })

async function updateCollectiveGoalStakeholders(uid: string, after: Profile) {
  const data: Partial<CollectiveGoalStakeholder> = {
    username: after.username,
    photoURL: after.photoURL
  }

  const stakeholdersSnap = await db.collectionGroup(`CGStakeholders`).where('uid', '==', uid).get()
  const promises = stakeholdersSnap.docs.map(doc => doc.ref.update(data))
  return Promise.all(promises)
}

async function updateGoalStakeholders(uid: string, after: Profile) {
  const data: Partial<GoalStakeholder> = {
    username: after.username,
    photoURL: after.photoURL
  }

  const stakeholdersSnap = await db.collectionGroup(`GStakeholders`).where('uid', '==', uid).get()
  const promises = stakeholdersSnap.docs.map(doc => doc.ref.update(data))
  return Promise.all(promises)
}

async function updateSpectators(uid: string, after: Profile) {
  console.log('uid: ', uid);
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