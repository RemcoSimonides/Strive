import { db, logger, gcsBucket, auth, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'

import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia'
import { createUser, createAlgoliaUser, createAssessLifeSettings, assessLifeQuestions } from '@strive/model'
import { updateAggregation } from '../../shared/aggregation/aggregation'
import { deleteCollection, toDate } from '../../shared/utils'

export const userCreatedHandler = onDocumentCreate(`Users/{uid}`, 'userCreatedHandler',
async (snapshot) => {

  const uid = snapshot.id
  const user = createUser({ ...snapshot.data(), uid: snapshot.id })

  // aggregation
  updateAggregation({ usersCreated: 1 })

  // automatically activate assess life exercise by setting default settings
  db.doc(`Users/${uid}/Exercises/AssessLife`).set(createAssessLifeSettings({ questions: assessLifeQuestions }))

  await addToAlgolia('user', uid, createAlgoliaUser(user))
})

export const userDeletedHandler = onDocumentDelete(`Users/{uid}`, 'userDeletedHandler',
async (snapshot) => {

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

  // TODO anonimyze comments from deleted user


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

export const userChangeHandler = onDocumentUpdate(`Users/{uid}`, 'userChangeHandler',
async (snapshot, context) => {

  const uid = context.params.uid
  const before = createUser({ ...snapshot.before.data(), uid: snapshot.before.id })
  const after = createUser({ ...snapshot.after.data(), uid: snapshot.after.id })


  if (before.username !== after.username || before.photoURL !== after.photoURL) {
    if (!after.username || !after.photoURL) {
      // TODO prevent this with firestore rules
      logger.error('SOMETHING WENT WRONG BEFORE THIS - WHAT DID YOU DO?: ', before, after)
      return
    }
  }

  if (before.username !== after.username || before.photoURL !== after.photoURL || before.numberOfSpectators !== after.numberOfSpectators) {
    logger.log('updating Algolia')
    await updateAlgoliaObject('user', uid, createAlgoliaUser(after))
  }
})
