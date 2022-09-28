import { db, increment, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '../../../internals/firebase'

import { toDate } from '../../../shared/utils'
import { sendNotificationToUsers } from '../../../shared/notification/notification'
import { createNotificationBase, createSpectator, Spectator } from '@strive/model'

export const userSpectatorCreatedHandler = onDocumentCreate(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`, 'userSpectatorCreatedHandler',
  async (snapshot, context) => {

    const spectator = createSpectator(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { uidToBeSpectated, uidSpectator } = context.params

    handleSpectatorNotifications(createSpectator(), spectator)

    if (spectator.isSpectator) {
      changeNumberOfSpectators(uidToBeSpectated, 1)
      changeNumberOfSpectating(uidSpectator, 1)
    }
  }
)

export const userSpectatorChangeHandler = onDocumentUpdate(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`, 'userSpectatorChangeHandler', 
  async (snapshot, context) => {

    const before = createSpectator(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
    const after = createSpectator(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))
    const { uidToBeSpectated, uidSpectator } = context.params

    if (before.isSpectator !== after.isSpectator) {
      const delta = after.isSpectator ? 1 : -1
      changeNumberOfSpectators(uidToBeSpectated, delta)
      changeNumberOfSpectating(uidSpectator, delta)
    }
  }
)

export const userSpectatorDeleteHandler = onDocumentDelete(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`, 'userSpectatorDeleteHandler',
  async (snapshot, context) => {

    const { uidToBeSpectated, uidSpectator} = context.params
  
    const userSnap = await db.doc(`Users/${uidToBeSpectated}`).get()
    if (userSnap.exists) {
      changeNumberOfSpectators(uidToBeSpectated, -1)
    }
    changeNumberOfSpectating(uidSpectator, -1)
  
  }
)

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
    const notification = createNotificationBase({
      event: 'userSpectatorCreated',
      userId: after.uid
    })
    sendNotificationToUsers(notification, after.profileId, 'user')
  }
}