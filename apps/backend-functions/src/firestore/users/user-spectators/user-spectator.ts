import { db, increment, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'

import { toDate } from '../../../shared/utils'
import { sendNotificationToUsers } from '../../../shared/notification/notification'
import { createNotificationBase, createSpectator, Spectator } from '@strive/model'

export const userSpectatorCreatedHandler = onDocumentCreate(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`,
  async (snapshot) => {

    const spectator = createSpectator(toDate({ ...snapshot.data.data(), id: snapshot.id }))
    const { uidToBeSpectated, uidSpectator } = snapshot.params

    handleSpectatorNotifications(createSpectator(), spectator)

    if (spectator.isSpectator) {
      changeNumberOfSpectators(uidToBeSpectated, 1)
      changeNumberOfSpectating(uidSpectator, 1)
    }
  }
)

export const userSpectatorChangeHandler = onDocumentUpdate(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`,
  async (snapshot) => {

    const before = createSpectator(toDate({ ...snapshot.data.before.data(), id: snapshot.id }))
    const after = createSpectator(toDate({ ...snapshot.data.after.data(), id: snapshot.id }))
    const { uidToBeSpectated, uidSpectator } = snapshot.params

    if (before.isSpectator !== after.isSpectator) {
      const delta = after.isSpectator ? 1 : -1
      changeNumberOfSpectators(uidToBeSpectated, delta)
      changeNumberOfSpectating(uidSpectator, delta)
    }
  }
)

export const userSpectatorDeleteHandler = onDocumentDelete(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`,
  async (snapshot) => {

    const { uidToBeSpectated, uidSpectator} = snapshot.params
    const spectator = createSpectator(toDate({ ...snapshot.data.data(), id: snapshot.id }))

    if (!spectator.isSpectator) return

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