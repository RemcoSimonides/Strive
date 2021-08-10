// Interfaces
import { Spectator } from '@strive/user/spectator/+state/spectator.firestore'
import { enumEvent } from '@strive/notification/+state/notification.firestore';
import { createNotification } from '@strive/notification/+state/notification.model';
import { sendNotificationToUsers } from '../../../shared/notification/notification'
import { createProfileLink } from '@strive/user/user/+state/user.firestore';

export function handleNotificationsOfCreatedUserSpectator(userSpectator: Spectator) {
  sendNotificationToUserBeingSpectated(userSpectator)
}

async function sendNotificationToUserBeingSpectated(userSpectator: Spectator) {

  // creating discussion id by combining both user id's with lowest in alphabet first
  const discussionId = userSpectator.profileId > userSpectator.uid ? `${userSpectator.uid}${userSpectator.profileId}` : `${userSpectator.profileId}${userSpectator.uid}` 

  const notification = createNotification({
    discussionId,
    event: enumEvent.userSpectatorAdded,
    type: 'notification',
    source: {
      user: createProfileLink(userSpectator)
    },
  })
  sendNotificationToUsers(notification, [userSpectator.profileId])
}