// Interfaces
import { ISpectator } from '@strive/interfaces';
import { enumEvent } from '@strive/notification/+state/notification.firestore';
import { createNotification } from '@strive/notification/+state/notification.model';
import { sendNotificationToUsers } from '../../../shared/notification/notification'

export function handleNotificationsOfCreatedUserSpectator(userSpectator: ISpectator) {
  sendNotificationToUserBeingSpectated(userSpectator)
}

async function sendNotificationToUserBeingSpectated(userSpectator: ISpectator): Promise<void> {

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