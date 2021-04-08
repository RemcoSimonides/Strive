import { db, functions, increment } from '../../../internals/firebase';

import { handleNotificationsOfCreatedUserSpectator } from './user-spectator.notification';
import { createSpectator } from '@strive/user/spectator/+state/spectator.firestore';

export const userSpectatorCreatedHandler = functions.firestore.document(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`)
  .onCreate(async (snapshot, context) => {

    const uidToBeSpectated = context.params.uidToBeSpectated
    const uidSpectator = context.params.uidSpectator

    const spectator = createSpectator(snapshot.data())

    if (spectator.isSpectator) {
      changeNumberOfSpectators(uidToBeSpectated, 1)
      changeNumberOfSpectating(uidSpectator, 1)
      handleNotificationsOfCreatedUserSpectator(spectator)
    }

  })

export const userSpectatorChangeHandler = functions.firestore.document(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`)
  .onUpdate(async (snapshot, context) => {

    const before = createSpectator(snapshot.before.data())
    const after = createSpectator(snapshot.after.data())
    const uidToBeSpectated = context.params.uidToBeSpectated
    const uidSpectator = context.params.uidSpectator

    if (before.isSpectator !== after.isSpectator) {

      if (after.isSpectator) {
        changeNumberOfSpectators(uidToBeSpectated, 1)
        changeNumberOfSpectating(uidSpectator, 1)
      } else {
        changeNumberOfSpectators(uidToBeSpectated, -1)
        changeNumberOfSpectating(uidSpectator, -1)
      }

    }

})  

function changeNumberOfSpectators(uidToBeSpectated: string, change: number) {
  const ref = db.doc(`Users/${uidToBeSpectated}/Profile/${uidToBeSpectated}`)
  return ref.update({ numberOfSpectators: increment(change) })
}

function changeNumberOfSpectating(uidSpectator: string, change: number) {
  const ref = db.doc(`Users/${uidSpectator}/Profile/${uidSpectator}`)
  return ref.update({ numberOfSpectating: increment(change) })
}