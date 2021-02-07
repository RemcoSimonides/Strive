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
import { enumDiscussionAudience } from '@strive/interfaces';
import { Notification, enumEvent, SupportDecisionMeta } from '@strive/notification/+state/notification.firestore'
import { enumMilestoneStatus } from '@strive/milestone/+state/milestone.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { createGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createNotificationSupport, createSupport } from '@strive/support/+state/support.firestore';
import { createNotification, createSupportDecisionMeta, SupportDecisionNotification } from '@strive/notification/+state/notification.model';
import { createCollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

export async function handleNotificationsOfCreatedGoal(goalId: string, goal: Goal): Promise<void> {
  console.log('executting handle notification of created goal')

  await createDiscussion(goal.title, { image: goal.image, name: `General discussion - ${goal.title}`, goalId: goalId }, enumDiscussionAudience.public, goalId)

  // New Goal
  if (!!goal.collectiveGoalId) {
    if (goal.publicity === 'public' || goal.publicity === 'collectiveGoalOnly') {
      await sendNewGoalNotificationInCollectiveGoal(goalId, goal)
    }
  }

  if (goal.publicity === 'public') {
    await sendNewGoalNotificationToUserSpectators(goalId, goalId, goal.title, goal.image)
  }

  sendNewGoalNotificationToGoal(goalId, goalId, goal.title, goal.image)
}

export async function handleNotificationsOfChangedGoal(goalId: string, before: Goal, after: Goal): Promise<void> {
  console.log('executing handle notification of changed goal')

  // finished goal
  if (before.isFinished !== after.isFinished && after.isFinished) {
  
    // Send finished goal notification to admins and achievers (no supporters)
    await sendFinishedGoalNotification(goalId, goalId, after)
    // Send finished goal notification to Supporters
    await sendFinishedGoalNotificationToSupporter(goalId, after)
    await sendGoalFinishedNotificationToUserSpectators(goalId, after.title, after.image)

    if (!!after.collectiveGoalId) {
      if (after.publicity === 'public' || after.publicity === 'collectiveGoalOnly') {
        await sendNotificationFinishedGoalInCollectiveGoal(goalId, after)
      }
    }
  }

    // new (public) goal in collective goal
    if (before.publicity === 'private' && (after.publicity === 'public' || after.publicity === 'collectiveGoalOnly')) {
        if (!!after.collectiveGoalId) {

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
function sendNewGoalNotificationToGoal(discussionId: string, goalId: string, title: string, image: string) {

  const notification: Partial<Notification> = {
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
  sendNotificationToGoal(goalId, notification)
}

async function sendNewGoalNotificationToUserSpectators(discussionId: string, goalId: string, goalTitle: string, goalImage: string): Promise<void> {

    console.log(`executing Send New Goal Notification to User Spectators`)

    const goalStakeholderColRef: admin.firestore.Query = db.collection(`Goals/${goalId}/GStakeholders`)
    const goalStakeholderColSnap: admin.firestore.QuerySnapshot = await goalStakeholderColRef.get()
    goalStakeholderColSnap.docs.forEach(async goalStakeholderSnap => {

        const goalStakeholder: GoalStakeholder = Object.assign(<GoalStakeholder>{}, goalStakeholderSnap.data())

        const notification: Partial<Notification> = {
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

async function sendNewGoalNotificationInCollectiveGoal(discussionId: string, goal: Goal) {

    if (!goal.collectiveGoalId) return
    console.log(`executing send new goal notification in collective goal (${goal.collectiveGoalId}) stakeholders`)

    const collectiveGoalSnap = await db.doc(`CollectiveGoals/${goal.collectiveGoalId}`).get()
    const collectiveGoal = createCollectiveGoal(collectiveGoalSnap.data());

    const notification: Partial<Notification> = {
        discussionId: discussionId,
        event: enumEvent.gNew,
        source: {
            image: goal.image,
            name: collectiveGoal.title,
            goalId: goal.id,
            collectiveGoalId: goal.collectiveGoalId,
        },
        message: [
            {
                text: `A new goal has been created in collective goal '`
            },
            {
                text: collectiveGoal.title,
                link: `collective-goal/${goal.collectiveGoalId}`
            },
            {
                text: `', can you help out?`
            }
        ]
    }

    await sendNotificationToCollectiveGoalStakeholders(goal.collectiveGoalId, notification, true, true)
    
}

// FINISHED GOAL
function sendFinishedGoalNotification(discussionId: string, goalId:  string, goal: Goal) {

  // Send finished goal notification to goal
  const goalNotification:  Partial<Notification> = {
      discussionId: discussionId,
      event: enumEvent.gFinished,
      source: {
        image: goal.image,
        name: goal.title,
        goalId: goalId,
        postId: goalId
      },
      message: [
        {
          text: `Goal is finished!`
        }
      ],
  }
  sendNotificationToGoal(goalId, goalNotification)
    
  // Send finished goal notification to Admin && Achiever
  const goalStakeholderNotification: Partial<Notification> = {
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

  sendNotificationToGoalStakeholders(goalId, goalStakeholderNotification, true, true, false)
}

async function sendFinishedGoalNotificationToSupporter(goalId: string, goal: Goal) {

  let supporters = {}
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
  Object.keys(supporters).forEach(supporter => {

    const date = new Date()

    const meta = createSupportDecisionMeta({
      deadline: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).toISOString(),
    })

    const notification: Notification<SupportDecisionMeta> = createNotification({
      id: goalId,
      discussionId: goalId,
      event: enumEvent.gFinished,
      source: {
        image: goal.image,
        name: goal.title,
        goalId: goalId,
        postId: goalId
      },
      type: 'supportDecision',
      message: [
        {
          text: 'Goal has been completed!'
        }
      ],
      meta,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    })

    // add supports to notification
    Object.keys(supporters[supporter]).forEach(support => {
      const notificationSupport = createNotificationSupport({
        id: support,
        description: supporters[supporter][support].description,
        milestoneIsFinished: supporters[supporter][support].milestoneIsFinished,
        receiver: {
          uid: supporters[supporter][support].receiverId,
          username: supporters[supporter][support].receiverUsername,
          photoURL: supporters[supporter][support].receiverPhotoURL
        }
      })
      notification.meta.supports.push(notificationSupport)
    })
        
    const promise = db.doc(`Users/${supporter}/Notifications/${goalId}`).set(notification)
    promises.push(promise)

  })
  await Promise.all(promises)
}

async function sendGoalFinishedNotificationToUserSpectators(goalId: string, goalTitle: string, goalImage: string): Promise<void> {

    const goalStakeholderColRef = db.collection(`Goals/${goalId}/GStakeholders`)
    const goalStakeholderColSnap = await goalStakeholderColRef.get()
    goalStakeholderColSnap.docs.forEach(stakeholderSnap => {
        
    const stakeholder = createGoalStakeholder(stakeholderSnap.data())
    if (!stakeholder.isAdmin && !stakeholder.isAchiever && !stakeholder.isSupporter) return

    const notification: Partial<SupportDecisionNotification> = {
      discussionId: goalId,
      event: enumEvent.gFinished,
      source: {
        image: stakeholder.photoURL,
        name: stakeholder.photoURL,
        userId: stakeholder.uid,
        goalId: goalId
      },
      message: [
        {
          text: stakeholder.username,
          link: `profile/${stakeholderSnap.id}`
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
      ]
    }

    sendNotificationToUserSpectators(stakeholderSnap.id, notification)
  })
}

async function sendNotificationFinishedGoalInCollectiveGoal(goalId: string, after: Goal): Promise<void> {

    if (!after.collectiveGoalId) return

    const collectiveGoalSnap = await db.doc(`CollectiveGoals/${after.collectiveGoalId}`).get()
    const collectiveGoal = createCollectiveGoal(collectiveGoalSnap.data());

    const notification: Partial<Notification> = {
      discussionId: goalId,
      event: enumEvent.gFinished,
      source: {
        image: collectiveGoal.image,
        name: collectiveGoal.title,
        collectiveGoalId: after.collectiveGoalId,
        goalId: goalId,
        postId: goalId
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
    }

    await sendNotificationToCollectiveGoalStakeholders(after.collectiveGoalId, notification, true, true)
}

// ROADMAP CHANGED
function sendRoadmapChangedNotifications(discussionId: string, goalId: string, after: Goal) {

  const goalNotification: Partial<Notification> = {
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
  sendNotificationToGoal(goalId, goalNotification)

  const goalStakeholderNotification: Partial<Notification> = {
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
  sendNotificationToGoalStakeholders(goalId, goalStakeholderNotification, true, true, true)
}

// MORE FUNCTIONS
async function getGoalSupports(goalId: string, supporters: any, receiver: IReceiver) {

  const supportsColRef = db.collection(`Goals/${goalId}/Supports`).where('goal.id', '==', goalId).where('milestone', '==', '')
  const supportsColSnap = await supportsColRef.get()
  supportsColSnap.forEach(supportSnap => {

    const support = createSupport(supportSnap.data());
    const supporterUID = support.supporter.uid
    const supportId = supportSnap.id

    if (!(supporterUID in supporters)) supporters[supporterUID] = {}
    if (!(supportId in supporters[supporterUID])) supporters[supporterUID][supportId] = {}

    supporters[supporterUID][supportId] = {
      description: support.description,
      milestoneIsFinished: true,
      receiverId: !!receiver ? receiver.id : '',
      receiverUsername: !!receiver ? receiver.username : '',
      receiverPhotoURL: !!receiver ? receiver.photoURL : ''
    }

  })
  return supporters
}

async function getUnfinishedMilestoneSupports(goalId: string, milestoneId: string, supporters: any, receiver: IReceiver) {

    const supportsRef = db.collection(`Goals/${goalId}/Supports`)
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
