import { db, functions, admin, increment } from '../../../internals/firebase';

import { handleNotificationsOfCreatedUserSpectator } from './user-spectator.notification'
import { ISpectator } from '@strive/interfaces';

export const userSpectatorCreatedHandler = functions.firestore.document(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`)
    .onCreate(async (snapshot, context) => {

        const uidToBeSpectated = context.params.uidToBeSpectated
        const uidSpectator = context.params.uidSpectator

        const spectator: ISpectator = Object.assign(<ISpectator>{}, snapshot.data())

        if (!spectator) return

        if (spectator.isSpectator) {

            await changeNumberOfSpectators(uidToBeSpectated, 1)
            await changeNumberOfSpectating(uidSpectator, 1)

            await handleNotificationsOfCreatedUserSpectator(spectator)
        }

    })

export const userSpectatorChangeHandler = functions.firestore.document(`Users/{uidToBeSpectated}/Spectators/{uidSpectator}`)
    .onUpdate(async (snapshot, context) => {

        const before = snapshot.before.data()
        const after = snapshot.after.data()
        const uidToBeSpectated = context.params.uidToBeSpectated
        const uidSpectator = context.params.uidSpectator
        if (!before) return
        if (!after) return

        if (before.isSpectator !== after.isSpectator) {

            if (after.isSpectator) {
                await changeNumberOfSpectators(uidToBeSpectated, 1)
                await changeNumberOfSpectating(uidSpectator, 1)
            } else {
                await changeNumberOfSpectators(uidToBeSpectated, -1)
                await changeNumberOfSpectating(uidSpectator, -1)
            }

        }

    })

async function changeNumberOfSpectators(uidToBeSpectated: string, change: number): Promise<void> {

    const profileRef: admin.firestore.DocumentReference = db.doc(`Users/${uidToBeSpectated}/Profile/${uidToBeSpectated}`)

    await profileRef.update({
        numberOfSpectators: increment(change)
    })

}

async function changeNumberOfSpectating(uidSpectator: string, change: number): Promise<void> {

    const profileRef: admin.firestore.DocumentReference = db.doc(`Users/${uidSpectator}/Profile/${uidSpectator}`)

    await profileRef.update({
        numberOfSpectating: increment(change)
    })

}