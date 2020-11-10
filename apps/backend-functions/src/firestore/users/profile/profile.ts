import { db, functions, admin } from '../../../internals/firebase';

import { Profile } from '@strive/user/user/+state/user.firestore';
import { addToAlgolia, deleteFromAlgolia } from '../../../shared/algolia/algolia';

export const profileCreatedHandler = functions.firestore.document(`Users/{userId}/Profile/{uid}`)
    .onCreate(async (snapshot, context) => {

        const uid = snapshot.id
        const profile: Profile = Object.assign(<Profile>{}, snapshot.data())

        if (!profile) return

        await addToAlgolia('user', uid, {
            uid: uid,
            username: profile.username,
            image: profile.image,
            numberOfSpectators: profile.numberOfSpectators
        })

    })

export const profileDeletedHandler = functions.firestore.document(`Users/{userId}/Profile/{uid}`)
    .onDelete(async (snapshot, context) => {

        const uid = snapshot.id
        try {
            await deleteFromAlgolia('user', uid)
        } catch (err) {
            console.log('deleting from Algolia error', err)
        }

    })

export const profileChangeHandler = functions.firestore.document(`Users/{userId}/Profile/{uid}`)
    .onUpdate(async (snapshot, context) => {

        const before: Profile = Object.assign(<Profile>{}, snapshot.before.data())
        const after: Profile = Object.assign(<Profile>{}, snapshot.after.data())
        if (!before) return
        if (!after) return

        const uid = context.params.userId

        console.log('fcm tokens', after.fcmTokens)
        if (before.fcmTokens !== after.fcmTokens && Array.isArray(after.fcmTokens)) {
            if (after.fcmTokens && after.fcmTokens.length > 0) {
                await admin.messaging().subscribeToTopic(after.fcmTokens, 'notifications')
                .then((res) => {
                    console.log('Successfully subscribed to topic:', res)
                })
                .catch((err) => {
                    console.log('Error subscribing tot topic', err)
                })
            }
        }

        await addToAlgolia('user', uid, {
            uid: uid,
            username: after.username,
            image: after.image,
            numberOfSpectators: after.numberOfSpectators
        })

        if (before.username !== after.username ||
            before.image !== after.image) {

                console.log(`username before: ${before.username}`)
                console.log(`username after: ${after.username}`)
                console.log(`image before: ${before.image}`)
                console.log(`image after: ${after.image}`)
                
                if (!after.username || !after.image) {
                    console.log('SOMETHING WENT WRONG BEFORE THIS - WHAT DID YOU DO?')
                    return
                }

                const p1 = updateGoalStakeholders(uid, after)
                const p2 = updateSpectators(uid, after)
                const p3 = updateCollectiveGoalStakeholders(uid, after)
                await Promise.all([p1, p2, p3])

            }

    })

async function updateCollectiveGoalStakeholders(uid: string, after: Profile): Promise<void> {

    const stakeholdersColRef =  db.collectionGroup(`CGStakeholders`).where('uid', '==', uid)
    const stakeholdersSnap = await stakeholdersColRef.get()

    const promises: any[] = []
    stakeholdersSnap.forEach(stakeholderSnap => {

        const promise = stakeholderSnap.ref.update({
            username: after.username,
            photoURL: after.image
        })

        promises.push(promise)

    })

    await Promise.all(promises)

}

async function updateGoalStakeholders(uid: string, after: Profile): Promise<void> {

    const stakeholdersColRef = db.collectionGroup(`GStakeholders`).where('uid', '==', uid)
    const stakeholdersSnap = await stakeholdersColRef.get()

    const promises: any[] = []
    stakeholdersSnap.forEach(stakeholderSnap => {

        console.log('updating stakeholder', stakeholderSnap)

        const promise = stakeholderSnap.ref.update({
            username: after.username,
            photoURL: after.image
        })

        promises.push(promise)

    })

    await Promise.all(promises)

}

async function updateSpectators(uid: string, after: Profile): Promise<void> {

    const spectatingsColRef = db.collectionGroup(`Spectators`).where('uid', '==', uid)
    const spectatingsSnap = await spectatingsColRef.get()
    
    const promises: any[] = []
    spectatingsSnap.forEach(spectatingSnap => {

        const promise = spectatingSnap.ref.update({
            username: after.username,
            photoURL: after.image
        })
        promises.push(promise)

    })

    const spectatorsColRef = db.collection(`Users/${uid}/Spectators`)
    const spectatorsSnap = await spectatorsColRef.get()

    spectatorsSnap.forEach(spectatorSnap => {

        const promise = spectatorSnap.ref.update({
            profileUsername: after.username,
            profilePhotoURL: after.image
        })
        promises.push(promise)

    })

    await Promise.all(promises)

}