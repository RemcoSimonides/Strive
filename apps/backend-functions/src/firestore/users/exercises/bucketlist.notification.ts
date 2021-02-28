import { db } from '../../../internals/firebase';
// Functions
import { sendNotificationToUserSpectators, createDiscussion } from '../../../shared/notification/notification'
import { Profile } from '@strive/user/user/+state/user.firestore'
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumEvent } from '@strive/notification/+state/notification.firestore';
import { BucketList, BucketListItem } from '@strive/exercises/bucket-list/+state/bucket-list.firestore';

export async function handleNotificationsOfBucketListCreated(uid: string) {

  // get profile for profile image and name
  const profileDocRef = db.doc(`Users/${uid}/Profile/${uid}`)
  const profileDocSnap = await profileDocRef.get()
  const profile: Profile = Object.assign(<Profile>{}, profileDocSnap.data())

  await createDiscussion(`Bucket List`, { image: 'assets/exercises/bucketlist/bucketlist.jpg', name: `BucketList - ${profile.username}`, userId: uid }, 'public', `${uid}bucketlist`)

  const notification = createNotification({
    discussionId: `${uid}bucketlist`,
    event: enumEvent.userExerciseBucketListCreated,
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
  await sendNotificationToUserSpectators(uid, notification)
}

export async function handleNotificationsOfBucketListChanged(uid: string, before: BucketList, after: BucketList) {

  // get profile for profile image and name
  const profileDocRef = db.doc(`Users/${uid}/Profile/${uid}`)
  const profileDocSnap = await profileDocRef.get()
  const profile: Profile = Object.assign(<Profile>{}, profileDocSnap.data())

  const changedPrivacyFromPrivateToSpectatorsOnlyOrPublic: BucketListItem[] = getChangedPrivacyFromPrivateToSpectatorsOnlyOrPublic(before, after)
  const changedDescription = getChangedDescriptionItems(before, after)
  const completedItems = getCompletedItems(before, after)
  const addedItems = getNonPrivateAddedItems(before, after)

  const totalNumberOfChangedItems: number = changedPrivacyFromPrivateToSpectatorsOnlyOrPublic.length + addedItems.length + changedDescription.length

  if (totalNumberOfChangedItems > 0) {
    sendChangedBucketListNotification(uid, profile, totalNumberOfChangedItems)
  }

  if (completedItems.length > 0) {
    completedItems.forEach(async item => {
      await sendBucketListItemComletedNotification(uid, profile, item.description)
    })
  }
}

function sendChangedBucketListNotification(uid: string, profile: Profile, numberOfChangedItems: number) {

  const notification = createNotification({
    discussionId: `${uid}bucketlist`,
    event: enumEvent.userExerciseBucketListItemAdded,
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

function getChangedPrivacyFromPrivateToSpectatorsOnlyOrPublic(before: BucketList, after: BucketList): BucketListItem[] {

  return before.items.filter(itemBefore => {
    if (itemBefore.privacy === 'private') {
      const itemAfter = after.items.find(x => x.description === itemBefore.description)
      return !!itemAfter && (itemAfter.privacy === 'spectatorsOnly' || itemAfter?.privacy === 'public')
    } else return false
  })
}

function getChangedDescriptionItems(before: BucketList, after: BucketList): BucketListItem[] {

  return before.items.filter(itemBefore => {  
    const itemAfter = after.items.find(x => x.description === itemBefore.description)
    if (itemAfter) {
        return itemAfter.description !== itemBefore.description ? true : false
    } else return false
  })
}

function getCompletedItems(before: BucketList, after: BucketList): BucketListItem[] {

  return before.items.filter(itemBefore => {
    // get the same after
    const itemAfter = after.items.find(x => x.description === itemBefore.description)
    if (itemAfter) {
      return itemAfter.completed !== itemBefore.completed ? true : false
    } else return false 
  })
}

function getNonPrivateAddedItems(before: BucketList, after: BucketList): BucketListItem[] {

  if (before.items.length < after.items.length) {
    return after.items.filter(itemAfter => {
      if (itemAfter.privacy === 'private') return false
      return !before.items.some(itemBefore => itemBefore.description === itemAfter.description)
    })
  } else return []
}