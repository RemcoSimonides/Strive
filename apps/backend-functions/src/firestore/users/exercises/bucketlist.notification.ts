import { db, admin } from '../../../internals/firebase';
// Functions
import { sendNotificationToUserSpectators, createDiscussion } from '../../../shared/notification/notification'
import { 
  IBucketList,
  IBucketListItem,
  enumPrivacy,
  INotificationBase,
  enumEvent,
  enumDiscussionAudience
} from '@strive/interfaces';
import { Profile } from '@strive/user/user/+state/user.firestore'

export async function handleNotificationsOfBucketListCreated(uid: string): Promise<void> {

    // get profile for profile image and name
    const profileDocRef: admin.firestore.DocumentReference = db.doc(`Users/${uid}/Profile/${uid}`)
    const profileDocSnap: admin.firestore.DocumentSnapshot = await profileDocRef.get()
    const profile: Profile = Object.assign(<Profile>{}, profileDocSnap.data())

    await createDiscussion(`Bucket List`, { image: 'assets/exercises/bucketlist/bucketlist.jpg', name: `BucketList - ${profile.username}`, userId: uid }, enumDiscussionAudience.public, `${uid}bucketlist`)

    const notification: Partial<INotificationBase> = {
        discussionId: `${uid}bucketlist`,
        event: enumEvent.userExerciseBucketListCreated,
        source: {
            image: profile.image,
            name: profile.username,
            userId: uid
        },
        message: [
            {
                text: profile.username,
                link: `profile/${uid}`
            },
            {
                text: ` has created a Bucket List! Can you help with some of the items on it?`
            }
        ]
    }
    await sendNotificationToUserSpectators(uid, notification)

}

export async function handleNotificationsOfBucketListChanged(uid: string, before: IBucketList, after: IBucketList): Promise<void> {

    // get profile for profile image and name
    const profileDocRef: admin.firestore.DocumentReference = db.doc(`Users/${uid}/Profile/${uid}`)
    const profileDocSnap: admin.firestore.DocumentSnapshot = await profileDocRef.get()
    const profile: Profile = Object.assign(<Profile>{}, profileDocSnap.data())

    const changedPrivacyFromPrivateToSpectatorsOnlyOrPublic: IBucketListItem[] = getChangedPrivacyFromPrivateToSpectatorsOnlyOrPublic(before, after)
    const changedDescription: IBucketListItem[] = getChangedDescriptionItems(before, after)
    const completedItems: IBucketListItem[] = getCompletedItems(before, after)
    const addedItems: IBucketListItem[] = getNonPrivateAddedItems(before, after)

    const totalNumberOfChangedItems: number = changedPrivacyFromPrivateToSpectatorsOnlyOrPublic.length + addedItems.length + changedDescription.length

    if (totalNumberOfChangedItems > 0) {
        await sendChangedBucketListNotification(uid, profile, totalNumberOfChangedItems)
    }

    if (completedItems.length > 0) {
        completedItems.forEach(async item => {
            await sendBucketListItemComletedNotification(uid, profile, item.description)
        })
    }

}

async function sendChangedBucketListNotification(uid: string, profile: Profile, numberOfChangedItems: number): Promise<void> {

    const notification: Partial<INotificationBase> = {
        discussionId: `${uid}bucketlist`,
        event: enumEvent.userExerciseBucketListItemAdded,
        source: {
            image: profile.image,
            name: profile.username,
            userId: uid,
        },
        message: [
            {
                text: profile.username,
                link: `profile/${uid}`
            },
            {
                text: ` has changed ${numberOfChangedItems} items on his/her Bucket List. Maybe you can help?`
            }
        ]
    }
    await sendNotificationToUserSpectators(uid, notification)

}

async function sendBucketListItemComletedNotification(uid: string, profile: Profile, bucketListItem: string): Promise<void> {

    const notification: Partial<INotificationBase> = {
        discussionId: `${uid}bucketlist`,
        event: enumEvent.userExerciseBucketListItemCompleted,
        source: {
            image: profile.image,
            name: profile.username,
            userId: uid,
        },
        message: [
            {
                text: profile.username,
                link: `profile/${uid}`
            },
            {
                text: ` ticked off '${bucketListItem}' from his/her Bucket List!`
            }
        ]
    }
    await sendNotificationToUserSpectators(uid, notification)

}

function getChangedPrivacyFromPrivateToSpectatorsOnlyOrPublic(before: IBucketList, after: IBucketList): IBucketListItem[] {

    return before.items.filter(itemBefore => {
        
        if (itemBefore.privacy === enumPrivacy.private) {

            const itemAfter = after.items.find(x => x.description === itemBefore.description)
            return itemAfter && (itemAfter.privacy  === enumPrivacy.spectatorsOnly || itemAfter?.privacy === enumPrivacy.public) ? true : false

        } else return false

    })

}

function getChangedDescriptionItems(before: IBucketList, after: IBucketList): IBucketListItem[] {

    return before.items.filter(itemBefore => {
        
        const itemAfter = after.items.find(x => x.description === itemBefore.description)
        if (itemAfter) {
            return itemAfter.description !== itemBefore.description ? true : false
        } else return false

    })

}

function getCompletedItems(before: IBucketList, after: IBucketList): IBucketListItem[] {

    return before.items.filter(itemBefore => {

        // get the same after
        const itemAfter = after.items.find(x => x.description === itemBefore.description)
        if (itemAfter) {
            return itemAfter.completed !== itemBefore.completed ? true : false
        } else return false 

    })

}

function getNonPrivateAddedItems(before: IBucketList, after: IBucketList): IBucketListItem[] {

    if (before.items.length < after.items.length) {
    
        return after.items.filter(itemAfter => {

            if (itemAfter.privacy === enumPrivacy.private) return false
            return !before.items.some(itemBefore => itemBefore.description === itemAfter.description)
            
        })

    } else return []

}