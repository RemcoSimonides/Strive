// Interfaces
import { ISpectator, INotificationBase, enumEvent } from '@strive/interfaces';
import { sendNotificationToUsers } from '../../../shared/notification/notification'

export async function handleNotificationsOfCreatedUserSpectator(userSpectator: ISpectator) {

    await sendNotificationToUserBeingSpectated(userSpectator)

}

async function sendNotificationToUserBeingSpectated(userSpectator: ISpectator): Promise<void> {

    // creating discussion id by combining both user id's with lowest in alphabet first
    const discussionId: string = userSpectator.profileId > userSpectator.uid ? `${userSpectator.uid}${userSpectator.profileId}` : `${userSpectator.profileId}${userSpectator.uid}` 

    const notification: Partial<INotificationBase> = {
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

    }
    await sendNotificationToUsers(notification, [userSpectator.profileId])

}