import { db } from '../../../internals/firebase';
// Functions
import { sendNotificationToUserSpectators, createDiscussion } from '../../../shared/notification/notification'
import { createProfile, Profile } from '@strive/user/user/+state/user.firestore'
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumEvent } from '@strive/notification/+state/notification.firestore';
import { BucketList, BucketListItem } from '@strive/exercises/bucket-list/+state/bucket-list.firestore';

export async function handleNotificationsOfBucketListCreated(uid: string) {

  const profileSnap = await db.doc(`Users/${uid}/Profile/${uid}`).get()
  const profile = createProfile(profileSnap.data())

  createDiscussion(`Bucket List`, { image: 'assets/exercises/bucketlist/bucketlist.jpg', name: `BucketList - ${profile.username}`, userId: uid }, 'public', `${uid}bucketlist`)

  const notification = createNotification({
    discussionId: `${uid}bucketlist`,
    event: enumEvent.userExerciseBucketListCreated,
    type: 'feed',
    source: {
      image: profile.photoURL,
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
  })
  sendNotificationToUserSpectators(uid, notification)
}

export async function handleNotificationsOfBucketListChanged(uid: string, before: BucketList, after: BucketList) {

  // get profile for profile image and name
  const profileSnap = await db.doc(`Users/${uid}/Profile/${uid}`).get()
  const profile = createProfile(profileSnap.data())

  const changedPrivacyFromPrivate: BucketListItem[] = getChangedPrivacyFromPrivate(before, after)
  const changedDescription = getChangedDescriptionItems(before, after)
  const completedItems = getCompletedItems(before, after)
  const addedItems = getNonPrivateAddedItems(before, after)

  const numberOfChangedItems = changedPrivacyFromPrivate.length + addedItems.length + changedDescription.length

  if (numberOfChangedItems > 0) {
    sendChangedBucketListNotification(uid, profile, numberOfChangedItems)
  }

  if (completedItems.length > 0) {
    completedItems.forEach(async item => {
      sendBucketListItemComletedNotification(uid, profile, item.description)
    })
  }
}

function sendChangedBucketListNotification(uid: string, profile: Profile, numberOfChangedItems: number) {

  const notification = createNotification({
    discussionId: `${uid}bucketlist`,
    event: enumEvent.userExerciseBucketListItemAdded,
    type: 'notification',
    source: {
      image: profile.photoURL,
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
  })
  sendNotificationToUserSpectators(uid, notification)
}

function sendBucketListItemComletedNotification(uid: string, profile: Profile, bucketListItem: string) {

  const notification = createNotification({
    discussionId: `${uid}bucketlist`,
    event: enumEvent.userExerciseBucketListItemCompleted,
    type: 'feed',
    source: {
      image: profile.photoURL,
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
  })
  sendNotificationToUserSpectators(uid, notification)
}

/**
 * Gets bucket list items which changed from Private to SpectatorOnly or Public
 */
function getChangedPrivacyFromPrivate(before: BucketList, after: BucketList): BucketListItem[] {
  return before.items.filter(itemBefore => {
    if (itemBefore.privacy === 'private') {
      const itemAfter = after.items.find(item => item.description === itemBefore.description)
      return !!itemAfter && (itemAfter.privacy === 'spectatorsOnly' || itemAfter?.privacy === 'public')
    } else return false
  })
}

function getChangedDescriptionItems(before: BucketList, after: BucketList): BucketListItem[] {
  return before.items.filter(itemBefore => {  
    const itemAfter = after.items.find(item => item.description === itemBefore.description)
    if (itemAfter) {
      return itemAfter.description !== itemBefore.description ? true : false
    } else return false
  })
}

function getCompletedItems(before: BucketList, after: BucketList): BucketListItem[] {
  return before.items.filter(itemBefore => {
    const itemAfter = after.items.find(item => item.description === itemBefore.description)
    if (itemAfter) {
      return itemAfter.completed !== itemBefore.completed ? true : false
    } else return false 
  })
}

function getNonPrivateAddedItems(before: BucketList, after: BucketList): BucketListItem[] {
  return after.items.filter(itemAfter => {
    if (itemAfter.privacy === 'private') return false
    return !before.items.some(itemBefore => itemBefore.description === itemAfter.description)
  })
}