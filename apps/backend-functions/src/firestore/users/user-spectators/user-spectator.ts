import { db, functions, increment } from '../../../internals/firebase';

import { toDate } from '../../../shared/utils';
import { sendNotificationToUsers } from '../../../shared/notification/notification'
import { createNotification, createNotificationSource, enumEvent, createSpectator, Spectator } from '@strive/model'

export const userSpectatorCreatedHandler = functions.firestore.document(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`)
  .onCreate(async (snapshot, context) => {

    const spectator = createSpectator(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { uidToBeSpectated, uidSpectator } = context.params

    handleSpectatorNotifications(createSpectator(), spectator)

    if (spectator.isSpectator) {
      changeNumberOfSpectators(uidToBeSpectated, 1)
      changeNumberOfSpectating(uidSpectator, 1)
    }
  })

export const userSpectatorChangeHandler = functions.firestore.document(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`)
  .onUpdate(async (snapshot, context) => {

    const before = createSpectator(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
    const after = createSpectator(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))
    const { uidToBeSpectated, uidSpectator } = context.params

    if (before.isSpectator !== after.isSpectator) {
      const delta = after.isSpectator ? 1 : -1
      changeNumberOfSpectators(uidToBeSpectated, delta)
      changeNumberOfSpectating(uidSpectator, delta)
    }
})  

function changeNumberOfSpectators(uidToBeSpectated: string, change: number) {
  const ref = db.doc(`Users/${uidToBeSpectated}`)
  return ref.update({ numberOfSpectators: increment(change) })
}

function changeNumberOfSpectating(uidSpectator: string, change: number) {
  const ref = db.doc(`Users/${uidSpectator}`)
  return ref.update({ numberOfSpectating: increment(change) })
}

function handleSpectatorNotifications(before: Spectator, after: Spectator) {
  const becameSpectator = !before.isSpectator && after.isSpectator
  if (becameSpectator) {
    const notification = createNotification({
      event: enumEvent.userSpectatorAdded,
      source: createNotificationSource({
        user: after
      })
    })
    sendNotificationToUsers(notification, after.profileId, 'user')
  }
}