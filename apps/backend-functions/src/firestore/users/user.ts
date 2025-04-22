import { db, logger, gcsBucket, auth, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'
import { defineString } from 'firebase-functions/params'

import { addToAlgolia, deleteFromAlgolia, updateAlgoliaObject } from '../../shared/algolia/algolia'
import { createUser, createAlgoliaUser, createSelfReflectSettings, selfReflectQuestions } from '@strive/model'
import { updateAggregation } from '../../shared/aggregation/aggregation'
import { deleteCollection, toDate } from '../../shared/utils'

export const userCreatedHandler = onDocumentCreate(`Users/{uid}`,
async (snapshot) => {

  const uid = snapshot.id
  const user = createUser({ ...snapshot.data.data(), uid: snapshot.id })

  // aggregation
  updateAggregation({ usersCreated: 1 })

  // automatically activate self reflect  exercise by setting default settings
  db.doc(`Users/${uid}/Exercises/SelfReflect`).set(createSelfReflectSettings({ questions: selfReflectQuestions }))

  await addToAlgolia('user', uid, createAlgoliaUser(user))
})

export const userDeletedHandler = onDocumentDelete(`Users/{uid}`,
async (snapshot) => {

  const uid = snapshot.id
  const user = createUser(toDate({ ...snapshot.data.data(), id: snapshot.id }))
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

  const scheduledTasksSnap = await db.collection(`ScheduledTasks`).where('options.userId', '==', uid).get()
  scheduledTasksSnap.docs.forEach(doc => doc.ref.delete())

  if (user.photoURL) {
    gcsBucket.file(user.photoURL).delete({ ignoreNotFound: true })
  }

  auth.deleteUser(uid)
})

export const userChangeHandler = onDocumentUpdate(`Users/{uid}`,
async (snapshot) => {

  const uid = defineString('uid').value()

  const before = createUser({ ...snapshot.data.before.data(), uid: snapshot.id })
  const after = createUser({ ...snapshot.data.after.data(), uid: snapshot.id })


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
