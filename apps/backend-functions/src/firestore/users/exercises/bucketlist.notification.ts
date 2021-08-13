import { db } from '../../../internals/firebase';
// Functions
import { addDiscussion, sendNotificationToUserSpectators } from '../../../shared/notification/notification'
import { createProfile, createProfileLink, Profile } from '@strive/user/user/+state/user.firestore'
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumEvent, Source } from '@strive/notification/+state/notification.firestore';
import { BucketList, BucketListItem } from '@strive/exercises/bucket-list/+state/bucket-list.firestore';

export async function handleNotificationsOfBucketListCreated(uid: string) {

  const profileSnap = await db.doc(`Users/${uid}/Profile/${uid}`).get()
  const profile = createProfile(profileSnap.data())

  const discussionId = `${uid}bucketlist`
  const source: Source = { user: createProfileLink(profile) }

  addDiscussion(`Bucket List`, source, 'public', discussionId)

  const notification = createNotification({
    discussionId,
    event: enumEvent.userExerciseBucketListCreated,
    type: 'feed',
    source
  })
  sendNotificationToUserSpectators(uid, notification)
}

export async function handleNotificationsOfBucketListChanged(uid: string, before: BucketList, after: BucketList) {

  // get profile for profile image and name
  const profileSnap = await db.doc(`Users/${uid}/Profile/${uid}`).get()
  const profile = createProfile(profileSnap.data())

  const changedPrivacyFromPrivate = getChangedPrivacyFromPrivate(before, after)
  const addedItems = getNonPrivateAddedItems(before, after).concat(changedPrivacyFromPrivate)
  const completedItems = getCompletedItems(before, after)


  if (addedItems.length) {
    sendItemsAddedNotification(uid, profile, addedItems)
  }

  if (completedItems.length > 0) {
    completedItems.forEach(item => {
      sendBucketListItemComletedNotification(uid, profile, item)
    })
  }
}

function sendItemsAddedNotification(uid: string, profile: Profile, items: BucketListItem[]) {
  const notification = createNotification({
    discussionId: `${uid}bucketlist`,
    event: enumEvent.userExerciseBucketListItemsAdded,
    type: 'notification',
    source: {
      user: createProfileLink({ ...profile, uid }),
      bucketList: items
    }
  })
  sendNotificationToUserSpectators(uid, notification)
}

function sendBucketListItemComletedNotification(uid: string, profile: Profile, bucketListItem: BucketListItem) {
  const notification = createNotification({
    discussionId: `${uid}bucketlist`,
    event: enumEvent.userExerciseBucketListItemCompleted,
    type: 'feed',
    target: 'spectator',
    source: {
      user: createProfileLink({ ...profile, uid }),
      bucketList: [bucketListItem]
    }
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