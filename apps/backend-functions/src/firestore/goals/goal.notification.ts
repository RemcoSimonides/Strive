import * as admin from 'firebase-admin'
import * as moment from 'moment'
// Functions
import { 
  sendNotificationToGoal,
  sendNotificationToGoalStakeholders,
  sendNotificationToCollectiveGoalStakeholders,
  sendNotificationToUserSpectators,
  createDiscussion
} from '../../shared/notification/notification'
import { IReceiver, getReceiver } from '../../shared/support/receiver'
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { 
  enumMilestoneStatus,
  INotificationBase,
  INotificationWithPostAndSupports,
  enumNotificationType,
  INotificationWithPost,
  enumEvent,
  enumDiscussionAudience
} from '@strive/interfaces';
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

export async function handleNotificationsOfCreatedGoal(goalId: string, goal: Goal): Promise<void> {
    console.log('executting handle notification of created goal')

    await createDiscussion(goal.title, { image: goal.image, name: `General discussion - ${goal.title}`, goalId: goalId }, enumDiscussionAudience.public, goalId)

    // New Goal
    if (goal.collectiveGoal && goal.collectiveGoal.id) {
        if (goal.publicity === 'public' || goal.publicity === 'collectiveGoalOnly') {
            await sendNewGoalNotificationInCollectiveGoal(goalId, goal)
        }
    }

    if (goal.publicity === 'public') {
        await sendNewGoalNotificationToUserSpectators(goalId, goalId, goal.title, goal.image)
    }

    await sendNewGoalNotificationToGoal(goalId, goalId, goal.title, goal.image)

}

export async function handleNotificationsOfChangedGoal(goalId: string, before: Goal, after: Goal): Promise<void> {
    console.log('executing handle notification of changed goal')

    // finished goal
    if (before.isFinished !== after.isFinished) {
        if (after.isFinished === true) {

            // Send finished goal notification to admins and achievers (no supporters)
            await sendFinishedGoalNotification(goalId, goalId, after)
            // Send finished goal notification to Supporters
            await sendFinishedGoalNotificationToSupporter(goalId, after)
            await sendGoalFinishedNotificationToUserSpectators(goalId, after.title, after.image)

            if (after.collectiveGoal && after.collectiveGoal.id) {
                if (after.publicity === 'public' || after.publicity === 'collectiveGoalOnly') {
                    await sendNotificationFinishedGoalInCollectiveGoal(goalId, after)
                }
            }

        }
    }

    // new (public) goal in collective goal
    if (before.publicity === 'private' && (after.publicity === 'public' || after.publicity === 'collectiveGoalOnly')) {
        if (after.collectiveGoal && after.collectiveGoal.id) {

            await sendNewGoalNotificationInCollectiveGoal(goalId, after)

        }
    }

    // Roadmap changed
    if (JSON.stringify(before.milestoneTemplateObject) !== JSON.stringify(after.milestoneTemplateObject)) {

        const momentBefore = moment(before.updatedAt)
        const momentAfter = moment(after.updatedAt)
        const isEarlierThanDayAgo = momentBefore.add(1, 'day').isAfter(momentAfter)
        
        if (!isEarlierThanDayAgo) {
            await sendRoadmapChangedNotifications(goalId, goalId, after)
        }

    }

}

// NEW GOAL NOTIFICATION
async function sendNewGoalNotificationToGoal(discussionId: string, goalId: string, title: string, image: string): Promise<void> {

    const notification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gNew,
        source: {
            image: image,
            name: title,
            goalId: goalId,
        },
        message: [
            {
                text: `New goal is created! Best of luck`
            }
        ]
    }
    await sendNotificationToGoal(goalId, notification)

}

async function sendNewGoalNotificationToUserSpectators(discussionId: string, goalId: string, goalTitle: string, goalImage: string): Promise<void> {

    console.log(`executing Send New Goal Notification to User Spectators`)

    const goalStakeholderColRef: admin.firestore.Query = db.collection(`Goals/${goalId}/GStakeholders`)
    const goalStakeholderColSnap: admin.firestore.QuerySnapshot = await goalStakeholderColRef.get()
    goalStakeholderColSnap.docs.forEach(async goalStakeholderSnap => {

        const goalStakeholder: GoalStakeholder = Object.assign(<GoalStakeholder>{}, goalStakeholderSnap.data())

        const notification: Partial<INotificationBase> = {
            discussionId: discussionId,
            event: enumEvent.gNew,
            source: {
                image: goalStakeholder.photoURL,
                name: goalStakeholder.username,
                userId: goalStakeholder.uid,
                goalId: goalId,
            },
            message: [
                {
                    text: `Created goal '`
                },
                {
                    text: goalTitle,
                    link: `goal/${goalId}`
                },
                {
                    text: `'`
                }
            ]
        }

        await sendNotificationToUserSpectators(goalStakeholderSnap.id, notification)

    })

}

async function sendNewGoalNotificationInCollectiveGoal(discussionId: string, goal: Goal): Promise<void> {

    if (!goal.collectiveGoal || !goal.collectiveGoal.id) return
    console.log(`executing send new goal notification in collective goal (${goal.collectiveGoal.id}) stakeholders`)

    const notification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gNew,
        source: {
            image: goal.image,
            name: goal.collectiveGoal.title,
            goalId: goal.id,
            collecetiveGoalId: goal.collectiveGoal.id,
        },
        message: [
            {
                text: `A new goal has been created in collective goal '`
            },
            {
                text: goal.collectiveGoal.title,
                link: `collective-goal/${goal.collectiveGoal.id}`
            },
            {
                text: `', can you help out?`
            }
        ]
    }

    await sendNotificationToCollectiveGoalStakeholders(goal.collectiveGoal.id, notification, true, true)
    
}

// FINISHED GOAL
async function sendFinishedGoalNotification(discussionId: string, goalId:  string, goal: Goal): Promise<void> {

        // Send finished goal notification to goal
        const goalNotification:  Partial<INotificationWithPost> = {
            discussionId: discussionId,
            event: enumEvent.gFinished,
            source: {
                image: goal.image,
                name: goal.title,
                goalId: goalId,
            },
            message: [
                {
                    text: `Goal is finished!`
                }
            ],
            path: {
                goalId: goalId,
                postId: goalId
            }
        }
        await sendNotificationToGoal(goalId, goalNotification)
    
        // Send finished goal notification to Admin && Achiever
        const goalStakeholderNotification: Partial<INotificationBase> = {
            discussionId: discussionId,
            event: enumEvent.gFinished,
            source: {
                image: goal.image,
                name: goal.title,
                goalId: goalId,
            },
            message: [
                {
                    text: `Congratulations, goal '`
                },
                {
                    text: goal.title,
                    link: `goal/${goalId}`
                },
                {
                    text: `' has been finished!`
                }
            ]
        }
    
        await sendNotificationToGoalStakeholders(goalId, goalStakeholderNotification, true, true, false)

}

async function sendFinishedGoalNotificationToSupporter(goalId: string, goal: Goal): Promise<void> {

    let supporters: any = {}
    const receiver: IReceiver | undefined = await getReceiver(goalId, db)

    supporters = await getGoalSupports(goalId, supporters, receiver)

    // get unfinished milestones and then its supports
    const milestonesRef: admin.firestore.Query = db.collection(`Goals/${goalId}/Milestones`).where('status', '==', enumMilestoneStatus.pending)
    const milestonesSnap: admin.firestore.QuerySnapshot = await milestonesRef.get()
    for (const milestoneSnap of milestonesSnap.docs) {

        const milestoneReceiver = <IReceiver>{}
        const milestone = milestoneSnap.data()
        milestoneReceiver.id = milestone.achieverId || null
        milestoneReceiver.username = milestone.achieverUsername || null
        milestoneReceiver.photoURL = milestone.achieverPhotoURL || null

        supporters = await getUnfinishedMilestoneSupports(goalId, milestoneSnap.id, supporters, milestoneReceiver)

    }

    // send notification to all supporters
    const promises: any[] = []
    Object.keys(supporters).forEach(async supporter => {

        const date = new Date()

        const newNotification: INotificationWithPostAndSupports = {
            id: goalId,
            discussionId: goalId,
            event: enumEvent.gFinished,
            source: {
                image: goal.image,
                name: goal.title,
                goalId: goalId
            },
            notificationType: enumNotificationType.evidence_pending,
            message: [
                {
                    text: `Goal is completed!`
                }
            ],
            isRead: false,
            path: {
                goalId: goalId,
                postId: goalId
            },
            supports: [],
            deadline: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).toISOString(),
            createdAt: serverTimestamp() as Timestamp,
            updatedAt: serverTimestamp() as Timestamp
        }

        // add supports to notification
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
        
        const promise = db.doc(`Users/${supporter}/Notifications/${goalId}`).set(newNotification)
        promises.push(promise)

    })

    await Promise.all(promises)

}

async function sendGoalFinishedNotificationToUserSpectators(goalId: string, goalTitle: string, goalImage: string): Promise<void> {

    const goalStakeholderColRef: admin.firestore.Query = db.collection(`Goals/${goalId}/GStakeholders`)
    const goalStakeholderColSnap: admin.firestore.QuerySnapshot = await goalStakeholderColRef.get()
    goalStakeholderColSnap.docs.forEach(async goalStakeholderSnap => {
        
        const goalStakeholder: GoalStakeholder = Object.assign(<GoalStakeholder>{}, goalStakeholderSnap.data())
        if (goalStakeholder.isAdmin !== true && goalStakeholder.isAchiever !== true && goalStakeholder.isSupporter !== true) return

        const notification: Partial<INotificationWithPost> = {
            discussionId: goalId,
            event: enumEvent.gFinished,
            source: {
                image: goalStakeholder.photoURL,
                name: goalStakeholder.photoURL,
                userId: goalStakeholder.uid,
                goalId: goalId
            },
            message: [
                {
                    text: goalStakeholder.username,
                    link: `profile/${goalStakeholderSnap.id}`
                },
                {
                    text: ` has finished goal '`
                },
                {
                    text: goalTitle,
                    link: `goal/${goalId}`
                },
                {
                    text: `'`
                }
            ],
            path: {
                goalId: goalId,
                postId: goalId
            }
        }

        await sendNotificationToUserSpectators(goalStakeholderSnap.id, notification)

    })

}

async function sendNotificationFinishedGoalInCollectiveGoal(goalId: string, after: Goal): Promise<void> {

    if (!after.collectiveGoal || !after.collectiveGoal.id) return

    const notification: Partial<INotificationWithPost> = {
        discussionId: goalId,
        event: enumEvent.gFinished,
        source: {
            image: after.collectiveGoal.image,
            name: after.collectiveGoal.title,
            collecetiveGoalId: after.collectiveGoal.id,
            goalId: goalId
        },
        message: [
            {
                text: `Goal '`
            },
            {
                text: after.title,
                link: `goal/${goalId}`
            },
            {
                text: `' is finished!`
            }
        ],
        path: {
            goalId: goalId,
            postId: goalId
        }
    }

    await sendNotificationToCollectiveGoalStakeholders(after.collectiveGoal.id, notification, true, true)

}

// ROADMAP CHANGED
async function sendRoadmapChangedNotifications(discussionId: string, goalId: string, after: Goal): Promise<void> {

    const goalNotification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gRoadmapUpdated,
        source: {
            image: after.image,
            name: after.title,
            goalId: goalId
        },
        message: [
            {
                text: `Roadmap has been changed`
            }
        ]
    }
    await sendNotificationToGoal(goalId, goalNotification)

    const goalStakeholderNotification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.gRoadmapUpdated,
        source: {
            image: after.image,
            name: after.title,
            goalId: goalId
        },
        message: [
            {
                text: `Roadmap of goal '`
            },
            {
                text: after.title,
                link: `goal/${goalId}`
            },
            {
                text: `' has been changed. Go and checkout what the new plan is!`
            }
        ]
    }
    await sendNotificationToGoalStakeholders(goalId, goalStakeholderNotification, true, true, true)

}

// MORE FUNCTIONS
async function getGoalSupports(goalId: string, supporters: any, receiver: IReceiver): Promise<any> {

    const supportsColRef = db.collection(`Goals/${goalId}/Supports`).where('goal.id', '==', goalId).where('milestone', '==', null)
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
                receiverId: receiver? receiver.id : null,
                receiverUsername: receiver ? receiver.username : null,
                receiverPhotoURL: receiver ? receiver.photoURL : null
            }

        }
    )

    return supporters

}

async function getUnfinishedMilestoneSupports(goalId: string, milestoneId: string, supporters: any, receiver: IReceiver): Promise<any> {

    const supportsRef: admin.firestore.Query = db.collection(`Goals/${goalId}/Supports`)
        .where('milestone.id', '==', milestoneId)
        .where('status', '==', enumMilestoneStatus.pending)
    const supportsSnap = await supportsRef.get()

    supportsSnap.forEach(supportSnap => {

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
