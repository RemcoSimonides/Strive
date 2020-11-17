import * as admin from 'firebase-admin'
// Functions
import { sendNotificationToGoal, sendNotificationToGoalStakeholders } from '../../../shared/notification/notification'
import { _increaseSeqnoByOne } from './milestone'
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import {
  IMilestone,
  enumMilestoneStatus,
  INotificationWithPost,
  enumNotificationType,
  INotificationWithPostAndSupports,
  enumEvent,
} from '@strive/interfaces';
import { IReceiver, getReceiver } from '../../../shared/support/receiver'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'

const db = admin.firestore()

export async function handleStatusChangeNotification(before: IMilestone, after: IMilestone, goalId: string, milestoneId: string) {

    // Get goal data for the title
    const goalRef: admin.firestore.DocumentReference = db.doc(`Goals/${goalId}`)
    const goalSnap: admin.firestore.DocumentSnapshot = await goalRef.get()
    const goal =  Object.assign(<Goal>{}, goalSnap.data())
    if (!goal) return

    // send notification to every stakeholder
    if (before.status === enumMilestoneStatus.pending  && after.status === enumMilestoneStatus.succeeded) {
        await sendNotificationMilestoneSuccessful(goalId, milestoneId, goal, after)
    } else if (before.status === enumMilestoneStatus.pending && after.status === enumMilestoneStatus.failed) {
        await sendNotificationMilestoneFailed(goalId, milestoneId, goal, after)
    }

    // send message to supporters (including the supports)
    // overwrite notification to supporters // send notification if person does not want level 1/2/3 milestone notifications but does support them
    const startText = `Milestone '${after.description}'`
    let endText = ''
    if (before.status === enumMilestoneStatus.pending && after.status === enumMilestoneStatus.succeeded) { //Before Pending, After Succeeded 
        endText = ` is successfully completed &#127881;`
    } else if (before.status === enumMilestoneStatus.pending && after.status === enumMilestoneStatus.failed) { // Before Pending, After Failed
        endText = ` has failed to complete`
    }

    //Send notification to supporters of this milestone
    let supporters: any = {}
    let receiver = <IReceiver>{}

    if (after.achieverId) {
        // achiever is assigned to milestone
        receiver.id = after.achieverId
        receiver.username = after.achieverUsername || ''
        receiver.photoURL = after.achieverPhotoURL || ''
    } else {
        // receiver is only achiever OR receiver object with NULL
        receiver = await getReceiver(goalId, db)
    }

    const supportsColRef = db.collection(`Goals/${goalId}/Supports`).where('milestone.id', '==', milestoneId)
    const supportsColSnap = await supportsColRef.get()
    supportsColSnap.forEach(
        (supportSnap): void => {

            const support = supportSnap.data();
            const supporterUID = support.supporter.uid
            const supportId = supportSnap.id

            if (!(supporterUID in supporters)) supporters[supporterUID] = {}
            if (!(supportId in supporters[supporterUID])) supporters[supporterUID][supportId] = {}

            supporters[supporterUID][supportId] = {
                description: support.description,
                milestoneIsFinished: true,
                receiverId: receiver ? receiver.id : null,
                receiverUsername: receiver ? receiver.username : null,
                receiverPhotoURL: receiver ? receiver.photoURL : null
            }

        }
    )

    const oneSeqnoHigher: string = _increaseSeqnoByOne(after.sequenceNumber)
    const subMilestonesRef: admin.firestore.Query = db.collection(`Goals/${goalId}/Milestones`)
        .where('status', '==', enumMilestoneStatus.pending)
        .where('sequenceNumber', '>', after.sequenceNumber)
        .where('sequenceNumber', '<', oneSeqnoHigher)
    const subMilestonesSnap: admin.firestore.QuerySnapshot = await subMilestonesRef.get()
    for (const subMilestoneSnap of subMilestonesSnap.docs) {

        const subReceiver = <IReceiver>{}
        const subMilestone = subMilestoneSnap.data()

        subReceiver.id = subMilestone.achieverId || null
        subReceiver.username = subMilestone.achieverUsername || null
        subReceiver.photoURL = subMilestone.achieverPhotoURL || null

        supporters = await getUnfinishedSupports(goalId, subMilestoneSnap.id, supporters, subReceiver)
    }

    const timestamp: FirebaseFirestore.FieldValue = admin.firestore.FieldValue.serverTimestamp()

    Object.keys(supporters).forEach(async supporter => {

        const date = new Date()

        const newNotification: INotificationWithPostAndSupports = {
            id: milestoneId,
            discussionId: milestoneId,
            event: enumEvent.gSupportStatusChangedToPending,
            source: {
                image: goal.image,
                name: goal.title,
                goalId: goalId,
                milestoneId: milestoneId
            },
            notificationType: enumNotificationType.evidence_pending,
            message: [
                {
                    text: startText
                },
                {
                    text: endText
                }
            ],
            isRead: false,
            path: {
                goalId: goalId,
                postId: milestoneId
            },
            supports: [],
            deadline: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).toISOString(),
            createdAt: timestamp as Timestamp,
            updatedAt: timestamp as Timestamp
        }


        Object.keys(supporters[supporter]).forEach(support => {

            if (!newNotification.supports) return

            newNotification.supports.push({
                id: support,
                description: supporters[supporter][support].description,
                decision: supporters[supporter][support].milestoneIsFinished ? 'give' : 'keep',
                milestoneIsFinished: supporters[supporter][support].milestoneIsFinished,
                receiverId: supporters[supporter][support].receiverId,
                receiverUsername: supporters[supporter][support].receiverUsername,
                receiverPhotoURL: supporters[supporter][support].receiverPhotoURL
            })

        })

        await db.doc(`Users/${supporter}/Notifications/${milestoneId}`).set(newNotification)  

    });

}

// Milestone successful
async function sendNotificationMilestoneSuccessful(goalId: string, milestoneId: string, goal: Goal, milestone: IMilestone): Promise<void> {

    const goalNotification: Partial<INotificationWithPost> = {
        discussionId: milestoneId,
        event: enumEvent.gMilestoneCompletedSuccessfully,
        source: {
            image: goal.image,
            name: goal.title,
            goalId: goalId,
            milestoneId: milestoneId
        },
        message: [
            {
                text: `Milestone '${milestone.description}' is successfully completed`
            }
        ],
        path: {
            goalId: goalId,
            postId: milestoneId
        }
    }
    await sendNotificationToGoal(goalId, goalNotification)

    const goalStakeholdersNotification: Partial<INotificationWithPost> = {
        id: milestoneId,
        discussionId: milestoneId,
        event: enumEvent.gMilestoneCompletedSuccessfully,
        source: {
            image: goal.image,
            name: goal.title,
            goalId: goalId,
            milestoneId: milestoneId
        },
        message: [
            {
                text: `Milestone '${milestone.description}' is successfully completed`
            }
        ],
        notificationType: enumNotificationType.general,
        path: {
            goalId: goalId,
            postId: milestoneId
        }
    }
    await sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true, true, true)

}

// Milestone failed
async function sendNotificationMilestoneFailed(goalId: string, milestoneId: string, goal: Goal, milestone: IMilestone): Promise<void> {

    const goalNotification: Partial<INotificationWithPost> = {
        discussionId: milestoneId,
        event: enumEvent.gMilestoneCompletedUnsuccessfully,
        source: {
            image: goal.image,
            name: goal.title,
            goalId: goalId,
            milestoneId: milestoneId
        },
        message: [
            {
                text: `Milestone '${milestone.description}' failed to completed'`
            }
        ],
        path: {
            goalId: goalId,
            postId: milestoneId
        }
    }
    await sendNotificationToGoal(goalId, goalNotification)

    const goalStakeholdersNotification: Partial<INotificationWithPost> = {
        discussionId: milestoneId,
        event: enumEvent.gMilestoneCompletedUnsuccessfully,
        source:  {
            image: goal.image,
            name: goal.title,
            goalId: goalId,
            milestoneId: milestoneId
        },
        message: [
            {
                text: `Milestone '${milestone.description}' failed to complete`
            }
        ],
        notificationType: enumNotificationType.general,
        path: {
            goalId: goalId,
            postId: milestoneId
        }
    }
    await sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true, true, true)

}

// Other functions
async function getUnfinishedSupports(goalId: string, milestoneId: string, supporters: any, receiver: IReceiver):Promise<any> {

    const supportsRef: admin.firestore.Query = db.collection(`Goals/${goalId}/Supports`).where('milestone.id', '==', milestoneId)
    const supportsSnap = await supportsRef.get()
    supportsSnap.forEach((supportSnap) => {

        const support = supportSnap.data()
        const supporterUID = support.supporter.uid
        const supportId = supportSnap.id

        if (!(supporterUID in supporters)) supporters[supporterUID] = {}
        if (!(supportId in supporters[supporterUID])) supporters[supporterUID][supportId] = {}

        supporters[supporterUID][supportId] = {
            description: support.description,
            milestoneIsFinished: false,
            receiverId: receiver ? receiver.id : null,
            receiverUsername: receiver ? receiver.username : null,
            receiverPhotoURL: receiver ? receiver.photoURL : null
        }

    })

    return supporters

}
