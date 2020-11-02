// Functions
import { 
  sendNotificationToGoal,
  sendNotificationToGoalStakeholders,
  sendNotificationToUsers,
  sendNotificationToUserSpectators,
  createDiscussion
} from '../../../shared/notification/notification'

// Interfaces
import {
  enumDiscussionAudience,
  INotificationBase,
  INotificationGoalRequest,
  enumNotificationType,
  enumRequestStatus,
  enumEvent
} from '@strive/interfaces';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'

export async function handleNotificationsOfStakeholderCreated(goalId: string, stakeholder: GoalStakeholder): Promise<void> {

    if (stakeholder.goalPublicity !== 'public') return

    if (stakeholder.isAdmin) {
        // const discussionId = await createDiscussion(enumDiscussionAudience.public)
        await sendNewAdminNotificationInGoal(goalId, goalId, stakeholder)
    }

    if (stakeholder.isAchiever) {
        // const discussionId = await createDiscussion()
        await sendNewAchieverNotificationInGoal(goalId, goalId, stakeholder)

        if (stakeholder.goalPublicity === 'public') {
            await sendNewAchieverNotificationToUserSpectators(goalId, goalId, stakeholder)
        }
    }

    if (stakeholder.isSupporter) {
        // const discussionId = await createDiscussion()
        await sendNewSupporterNotificationInGoal(goalId, goalId, stakeholder)

        if (stakeholder.goalPublicity === 'public') {
            await sendNewSupporterNotificationToUserSpectators(goalId, goalId, stakeholder)
        }
    }

    if  (stakeholder.hasOpenRequestToJoin) {
        const discussionId = await createDiscussion(`Request to become Achiever`, { image: stakeholder.goalImage, name: `Request to join ${stakeholder.goalTitle}`, goalId: stakeholder.goalId }, enumDiscussionAudience.adminsAndRequestor, undefined, stakeholder.uid)
        await sendNewRequestToJoinGoalNotificationInGoal(discussionId, goalId, stakeholder)
    }

}

export async function handleNotificationsOfStakeholderChanged(goalId: string, before: GoalStakeholder, after: GoalStakeholder): Promise<void> {

    if (before.isAdmin !== after.isAdmin) {
        if (after.isAdmin) {
            await sendNewAdminNotificationInGoal(goalId, goalId, after)
        }
    }

    if (before.isAchiever !== after.isAchiever) {
        if (after.isAchiever) {
            await sendNewAchieverNotificationInGoal(goalId, goalId, after)
            
            if (after.goalPublicity === 'public') {
                await sendNewAchieverNotificationToUserSpectators(goalId, goalId, after)
            }
        }
    }

    if (before.isSupporter !== after.isSupporter) {
        if (after.isSupporter) {
            await sendNewSupporterNotificationInGoal(goalId, goalId, after)

            if (after.goalPublicity === 'public') {
                await sendNewSupporterNotificationToUserSpectators(goalId, goalId, after)
            }
        }
    }

    // requests
    const discussionId = `RtjG${after.uid}`

    if (!before.hasOpenRequestToJoin && after.hasOpenRequestToJoin) {
        await createDiscussion(`Request to become Achiever`, { image: after.goalImage, name: `Request to join ${after.goalTitle}`, goalId: after.goalId }, enumDiscussionAudience.adminsAndRequestor, discussionId, after.uid)
        await sendNewRequestToJoinGoalNotificationInGoal(discussionId, goalId, after)
    }

    if (before.hasOpenRequestToJoin === true && after.hasOpenRequestToJoin === false) {
            if (before.isAchiever === false && after.isAchiever === true) {
            // if stakeholder is now achiever, then request is accepted
            await sendRequestToJoinGoalAcceptedNotification(discussionId, goalId, after)

        } else {
            await sendRequestToJoinGoalRejectedNotification(discussionId, goalId, after)

        }
    }

}

// NEW ACHIEVER
async function sendNewAchieverNotificationToUserSpectators(discussionId: string, goalId: string, stakeholder: GoalStakeholder): Promise<void> {

    const notification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderAchieverAdded,
        source: {
            image: stakeholder.photoURL,
            name: stakeholder.username,
            userId: stakeholder.uid,
            goalId: goalId
        },
        message: [
            {
                text: `Joined goal '`
            },
            {
                text: stakeholder.goalTitle,
                link: `goal/${stakeholder.goalId}`
            },
            {
                text: `' as an Achiever`
            }
        ]
    }
    await sendNotificationToUserSpectators(stakeholder.uid, notification)

}

async function sendNewAchieverNotificationInGoal(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder): Promise<void> {

    const goalNotification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderAchieverAdded,
        source: {
            image: goalStakeholder.photoURL,
            name: goalStakeholder.username,
            userId: goalStakeholder.uid,
            goalId: goalId
        },
        message: [
            {
                text: `Is now helping out as an Achiever!`
            },
        ]
    }
    await sendNotificationToGoal(goalId, goalNotification)

    const goalStakeholdersNotification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderAchieverAdded,
        source: {
            image: goalStakeholder.goalImage,
            name: goalStakeholder.goalTitle,
            goalId: goalId
        },
        message: [
            {
                text: goalStakeholder.username,
                link: `profile/${goalStakeholder.uid}`
            },
            {
                text: ` is now helping out!`
            }
        ]
    }

    // send to all achievers and admins
    await sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true, true, true)

}

// NEW SUPPORTER
async function sendNewSupporterNotificationToUserSpectators(discussionId: string, goalId: string, stakeholder: GoalStakeholder): Promise<void> {

    const notification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gSupportAdded,
        source: {
            image: stakeholder.photoURL,
            name: stakeholder.username,
            userId: stakeholder.uid,
            goalId: goalId
        },
        message: [
            {
                text: `Started supporting goal '`
            },
            {
                text: stakeholder.goalTitle,
                link: `goal/${goalId}`
            },
            {
                text: `'`
            }
        ]
    }
    await sendNotificationToUserSpectators(stakeholder.uid, notification)

}

async function sendNewSupporterNotificationInGoal(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder): Promise<void> {

    const goalNotification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderSupporterAdded,
        source:  {
            image: goalStakeholder.photoURL,
            name: goalStakeholder.username,
            userId: goalStakeholder.uid,
            goalId: goalId
        },
        message: [
            {
                text: `Is now supporting :)`
            },
        ]
    }
    await sendNotificationToGoal(goalId, goalNotification)

    const goalStakeholdersNotification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderSupporterAdded,
        source: {
            image: goalStakeholder.goalImage,
            name: goalStakeholder.goalTitle,
            goalId: goalId
        },
        message: [
            {
                text: goalStakeholder.username,
                link: `profile/${goalStakeholder.uid}`
            },
            {
                text: ` is now supporting :)`
            }
        ]
    }
    await sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true, true, true)

}

// NEW ADMIN
async function sendNewAdminNotificationInGoal(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder): Promise<void> {

    const goalNotification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderAdminAdded,
        source: {
            image: goalStakeholder.photoURL,
            name: goalStakeholder.username,
            userId: goalStakeholder.uid,
            goalId: goalId
        },
        message: [
            {
                text: `Became admin`
            },
        ]
    }
    await sendNotificationToGoal(goalId, goalNotification)

    const goalStakeholdersNotification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderAdminAdded,
        source: {
            image: goalStakeholder.goalImage,
            name: goalStakeholder.goalTitle,
            goalId: goalId
        },
        message: [
            {
                text: goalStakeholder.username,
                link: `profile/${goalStakeholder.uid}`
            },
            {
                text: ` is now admin`
            }
        ]
    }
    await sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true)

}

// REQUEST TO JOIN
async function sendNewRequestToJoinGoalNotificationInGoal(discussionId: string, goalId: string,  goalStakeholder: GoalStakeholder): Promise<void> {
    console.log('send New Request To Join Goal Notification In Goal')

    // Send request to admins only
    const goalStakeholdersNotification: Partial<INotificationGoalRequest> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderRequestToJoinPending,
        source: {
            image: goalStakeholder.goalImage,
            name: goalStakeholder.goalTitle,
            goalId: goalId
        },
        message: [
            {
                text: goalStakeholder.username,
                link: `profile/${goalStakeholder.uid}`
            },
            {
                text: ` requests to join, do you accept?`
            }
        ],
        notificationType: enumNotificationType.goal_request_to_join,
        requestPath: {
            goalId: goalId,
            uidRequestor: goalStakeholder.uid
        },
        requestStatus: enumRequestStatus.open
    }
    await sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true)

}

async function sendRequestToJoinGoalAcceptedNotification(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder): Promise<void> {

    const notification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderRequestToJoinAccepted,
        source: {
            image: goalStakeholder.goalImage,
            name: goalStakeholder.goalTitle,
            goalId: goalId
        },
        message: [
            {
                text: `Your request to join has been accepted`
            }
        ]
    }

    const receivers: string[] = []
    receivers.push(goalStakeholder.uid)

    await sendNotificationToUsers(notification, receivers)

}

async function sendRequestToJoinGoalRejectedNotification(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder): Promise<void> {

    const notification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gStakeholderRequestToJoinRejected,
        source: {
            image: goalStakeholder.goalImage,
            name: goalStakeholder.goalTitle,
            goalId: goalId
        },
        message: [
            {
                text: `Your request to join has been rejected`
            }
        ]
    }

    const receivers: string[] = []
    receivers.push(goalStakeholder.uid)

    await sendNotificationToUsers(notification, receivers)

}

