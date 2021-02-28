// Interfaces
import { Spectator } from '@strive/user/spectator/+state/spectator.firestore'
import { enumEvent } from '@strive/notification/+state/notification.firestore';
import { createNotification } from '@strive/notification/+state/notification.model';
import { sendNotificationToUsers } from '../../../shared/notification/notification'

export function handleNotificationsOfCreatedUserSpectator(userSpectator: Spectator) {
  sendNotificationToUserBeingSpectated(userSpectator)
}

async function sendNotificationToUserBeingSpectated(userSpectator: Spectator) {

  // creating discussion id by combining both user id's with lowest in alphabet first
  const discussionId: string = userSpectator.profileId > userSpectator.uid ? `${userSpectator.uid}${userSpectator.profileId}` : `${userSpectator.profileId}${userSpectator.uid}` 

  const notification = createNotification({
    discussionId: discussionId,
    event: enumEvent.userSpectatorAdded,
    source: {
      image: userSpectator.photoURL,
      name: userSpectator.username,
      userId: userSpectator.uid
    },
    message: [
      {
        text: `${userSpectator.username}`,
        link: `profile/${userSpectator.uid}`
      }, 
      {
        text: `is now following you`
      }
    ]
  })
  sendNotificationToUsers(notification, [userSpectator.profileId])
}