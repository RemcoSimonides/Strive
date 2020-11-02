import * as admin from 'firebase-admin'
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { INotificationBase, enumEvent, enumNotificationType, ISupport, enumSupportStatus, enumDiscussionAudience } from '@strive/interfaces'
import { sendNotificationToGoalStakeholders, sendNotificationToUsers, createDiscussion } from "../../../shared/notification/notification"
import { enumImage } from '@strive/interfaces';
import { Goal } from '@strive/goal/goal/+state/goal.firestore'

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

export async function handleNotificationsOfCreatedSupport(supportId: string, goalId: string, support: ISupport): Promise<void> {

    await createDiscussion(`Support '${support.description}'`, { image: support.goal.image, name: support.goal.title, goalId: support.goal.id }, enumDiscussionAudience.achievers, supportId)
    await sendNewSupportNotificationToAchieversOfGoal(supportId, goalId, support)

}

export async function handleNotificationsOfChangedSupport(supportId: string, goalId: string, before: ISupport, after: ISupport): Promise<void> {

    if (before.status !== after.status) {
        if (after.status === enumSupportStatus.paid) {
            await sendSupportPaidNotification(supportId, after)
        }

        if (after.status === enumSupportStatus.rejected) {
            await sendSupportRejectedNotification(supportId, goalId, after)
        }

        if (after.status === enumSupportStatus.waiting_to_be_paid) {
            await sendSupportIsWaitingToBePaid(supportId, after)
        }

    }

}

async function sendNewSupportNotificationToAchieversOfGoal(supportId: string, goalId: string, support: ISupport): Promise<void> {

    //Prepare notification object
    const newNotification: INotificationBase = {
        id: goalId,
        discussionId: supportId,
        event: enumEvent.gSupportAdded,
        source: {
            image: enumImage.supportLogo,
            name: support.goal.title,
            goalId: goalId,
            supportId: supportId
        },
        notificationType: enumNotificationType.general,
        message: [
            {
                text: support.supporter.username,
                link: `profile/${support.supporter.uid}`
            },
            {
                text: support.milestone && support.milestone.description ? ` is now supporting milestone ${support.milestone.description}` : ` is now supporting`
            },
            {
                text: ` with ${support.description}`
            }
        ],
        isRead: false,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
    }
    await sendNotificationToGoalStakeholders(goalId, newNotification, undefined, true)

}

async function sendSupportPaidNotification(supportId: string, support: ISupport): Promise<void> {

    if (!support.receiver || !support.receiver.uid) return
    if (support.receiver.uid === support.supporter.uid) return

    const notification: Partial<INotificationBase> = {
        discussionId: supportId,
        event: enumEvent.gSupportPaid,
        source: {
            image: enumImage.supportLogo,
            name: support.goal.title,
            goalId: support.goal.id,
            supportId: supportId
        },
        message: [
            {
                text: support.supporter.username,
                link: `profile/${support.supporter.uid}`
            },
            {
                text: ` paid support '${support.description}'`
            }
        ]
    }

    const receivers: string[] = []
    receivers.push(support.receiver.uid ? support.receiver.uid : '')

    await sendNotificationToUsers(notification, receivers)

}

async function sendSupportRejectedNotification(supportId: string, goalId: string, support: ISupport): Promise<void> {

    let notification: Partial<INotificationBase>

    if (support.milestone) {
        // milestone support
        notification = {
            discussionId: supportId,
            event: enumEvent.gSupportRejected,
            source: {
                image: enumImage.supportLogo,
                name: support.goal.title,
                goalId: goalId,
                supportId: supportId
            },
            message: [
                {
                    text: support.supporter.username,
                    link: `profile/${support.supporter.uid}`
                },
                {
                    text: ` rejected paying support '${support.description}' for milestone '${support.milestone.description}' in goal '`
                },
                {
                    text: support.goal.title,
                    link: `goal/${support.goal.id}`
                },
                {
                    text: `'`
                }
            ]
        }
    } else {
        // goal support
        notification = {
            discussionId: supportId,
            event: enumEvent.gSupportRejected,
            source: {
                image: enumImage.supportLogo,
                name: support.goal.title,
                goalId: goalId,
                supportId: supportId
            },
            message: [
                {
                    text: support.supporter.username,
                    link: `profile/${support.supporter.uid}`
                },
                {
                    text: ` rejected paying support '${support.description}' for goal '`
                },
                {
                    text: support.goal.title,
                    link: `goal/${support.goal.id}`
                },
                {
                    text: `'`
                }
            ]
        }
    }
    
    await sendNotificationToGoalStakeholders(goalId, notification, true, true, false)
    
}

async function sendSupportIsWaitingToBePaid(supportId: string, support: ISupport): Promise<void> {

    if (!support.receiver || !support.receiver.uid) return
    if (support.receiver.uid === support.supporter.uid) return

    const notification: Partial<INotificationBase> = {
        discussionId: supportId,
        event: enumEvent.gSupportWaitingToBePaid,
        source: {
            image: enumImage.supportLogo,
            name: support.goal.title,
            goalId: support.goal.id,
            supportId: supportId
        },
        message: [
            {
                text: support.supporter.username,
                link: `profile/${support.supporter.uid}`
            },
            {
                text: ` is going to give you the support '${support.description}' :)`
            }
        ]
    }

    const receivers: string[] = []
    receivers.push(support.receiver.uid ? support.receiver.uid : '')

    await sendNotificationToUsers(notification, receivers)

}

export async function sendSupportDeletedNotification(goalId: string, supportId: string,  support: ISupport): Promise<void> {

    // get goal doc for image
    const goalDocRef: FirebaseFirestore.DocumentReference = db.doc(`Goals/${goalId}`)
    const goalDocSnap: FirebaseFirestore.DocumentSnapshot = await goalDocRef.get()
    const goal: Goal = Object.assign(<Goal>{}, goalDocSnap.data())

    // send notification
    if (support.milestone !== undefined) {

        // because milestone has been deleted
        const notification: Partial<INotificationBase> = {
            discussionId: support.milestone.id,
            event: enumEvent.gSupportDeleted,
            source: {
                image: goal.image,
                name: goal.title,
                goalId: goalId,
                milestoneId: support.milestone.id,
                supportId: supportId
            },
            message: [
                {
                    text: `Support '${support.description}' has been deleted because milestone '${support.milestone.description}' has been deleted`
                }
            ]
        }
        await sendNotificationToUsers(notification, [support.supporter.uid])

    } else {
        
        // because goal has been deleted
        const notification: Partial<INotificationBase> = {
            discussionId:  support.goal.id,
            event: enumEvent.gSupportDeleted,
            source: {
                image: goal.image,
                name:  goal.title,
                goalId: goalId,
                supportId: supportId
            },
            message: [
                {
                    text: `Support '${support.description}' has been deleted because goal '${support.goal.title}' has been deleted`
                }
            ]
        }
        await sendNotificationToUsers(notification, [support.supporter.uid])

    }

}