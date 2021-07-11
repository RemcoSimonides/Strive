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
import { getReceiver } from '../../shared/support/receiver'
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { Notification, enumEvent } from '@strive/notification/+state/notification.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createNotificationSupport, createSupport, NotificationSupport, Support } from '@strive/support/+state/support.firestore';
import { createNotification, createSupportDecisionMeta } from '@strive/notification/+state/notification.model';
import { createCollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { ProfileLink } from '@strive/user/user/+state/user.firestore';
import { createMilestone, Milestone } from '@strive/milestone/+state/milestone.firestore';
import { converter } from '../../shared/utils';

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

export async function handleNotificationsOfCreatedGoal(goalId: string, goal: Goal): Promise<void> {
  console.log('executting handle notification of created goal')

  await createDiscussion(goal.title, { image: goal.image, name: `General discussion - ${goal.title}`, goalId: goalId }, 'public', goalId)

  // New Goal
  if (!!goal.collectiveGoalId) {
    if (goal.publicity === 'public' || goal.publicity === 'collectiveGoalOnly') {
      sendNewGoalNotificationInCollectiveGoal(goalId, goal)
    }
  }

  if (goal.publicity === 'public') {
    sendNewGoalNotificationToUserSpectators(goalId, goalId, goal.title)
  }

  sendNewGoalNotificationToGoal(goalId, goalId, goal.title, goal.image)
}

export async function handleNotificationsOfChangedGoal(goalId: string, before: Goal, after: Goal): Promise<void> {
  console.log('executing handle notification of changed goal')

  // finished goal
  if (!before.isFinished && after.isFinished) {
  
    // Send finished goal notification to admins and achievers (no supporters)
    sendFinishedGoalNotification(goalId, goalId, after)
    // Send finished goal notification to Supporters
    sendFinishedGoalNotificationToSupporter(goalId, after)
    sendGoalFinishedNotificationToUserSpectators(goalId, after.title)

    if (!!after.collectiveGoalId) {
      if (after.publicity === 'public' || after.publicity === 'collectiveGoalOnly') {
        sendNotificationFinishedGoalInCollectiveGoal(goalId, after)
      }
    }
  }

  // new (public) goal in collective goal
  if (before.publicity === 'private' && (after.publicity === 'public' || after.publicity === 'collectiveGoalOnly')) {
    if (!!after.collectiveGoalId) {
      sendNewGoalNotificationInCollectiveGoal(goalId, after)
    }
  }

  // Roadmap changed
  if (JSON.stringify(before.roadmapTemplate) !== JSON.stringify(after.roadmapTemplate)) {

    const momentBefore = moment(before.updatedAt)
    const momentAfter = moment(after.updatedAt)
    const isEarlierThanDayAgo = momentBefore.add(1, 'day').isAfter(momentAfter)
    
    if (!isEarlierThanDayAgo) {
      sendRoadmapChangedNotifications(goalId, goalId, after)
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
      goalId
    },
    message: [
      {
        text: `New goal is created! Best of luck`
      }
    ]
  }
  sendNotificationToGoal(goalId, notification)
}

async function sendNewGoalNotificationToUserSpectators(discussionId: string, goalId: string, goalTitle: string) {

  console.log(`executing Send New Goal Notification to User Spectators`)

  const goalStakeholderColSnap = await db.collection(`Goals/${goalId}/GStakeholders`).get()

  for (const snap of goalStakeholderColSnap.docs) {
    const stakeholder = createGoalStakeholder(snap.data())
    const notification = createNotification({
      discussionId,
      event: enumEvent.gNew,
      type: 'feed',
      source: {
        image: stakeholder.photoURL,
        name: stakeholder.username,
        userId: stakeholder.uid,
        goalId
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
          text: `'. Can you help out?`
        }
      ]
    })
    sendNotificationToUserSpectators(snap.id, notification)
  }
}

async function sendNewGoalNotificationInCollectiveGoal(discussionId: string, goal: Goal) {

  if (!goal.collectiveGoalId) return
  console.log(`executing send new goal notification in collective goal (${goal.collectiveGoalId}) stakeholders`)

  const collectiveGoalSnap = await db.doc(`CollectiveGoals/${goal.collectiveGoalId}`).get()
  const collectiveGoal = createCollectiveGoal(collectiveGoalSnap.data());

  const notification = createNotification({
    discussionId,
    event: enumEvent.gNew,
    type: 'notification',
    source: {
      image: collectiveGoal.image,
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
  })

  return sendNotificationToCollectiveGoalStakeholders(goal.collectiveGoalId, notification, true, true)
}

// FINISHED GOAL
function sendFinishedGoalNotification(discussionId: string, goalId:  string, goal: Goal) {

  // Send finished goal notification to goal
  const goalNotification = createNotification({
    discussionId,
    event: enumEvent.gFinished,
    type: 'feed',
    source: {
      image: goal.image,
      name: goal.title,
      goalId,
      postId: goalId
    },
    message: [
      {
        text: `Goal is finished!`
      }
    ],
  })
  sendNotificationToGoal(goalId, goalNotification)
    
  // Send finished goal notification to Admin && Achiever
  const goalStakeholderNotification = createNotification({
    discussionId,
    event: enumEvent.gFinished,
    type: 'feed',
    source: {
      image: goal.image,
      name: goal.title,
      goalId,
    },
    message: [
      {
        text: `Congratulations! goal '`
      },
      {
        text: goal.title,
        link: `goal/${goalId}`
      },
      {
        text: `' has been finished.`
      }
    ]
  })

  sendNotificationToGoalStakeholders(goalId, goalStakeholderNotification, true, true, false)
}

async function sendFinishedGoalNotificationToSupporter(goalId: string, goal: Goal) {

  const supporters: Record<string, NotificationSupport[]> = {}
  const receiver: ProfileLink | undefined = await getReceiver(goalId, db)

  // get unfinished milestones and then its supports
  const milestonesSnap = await db.collection(`Goals/${goalId}/Milestones`)
    .where('status', '==', 'pending')
    .withConverter<Milestone>(converter(createMilestone))
    .get()
  const milestones = milestonesSnap.docs.map(snap => snap.data());

  // get supports
  const supportsQueries = milestones.map(milestone => db.collection(`Goals/${goalId}/Supports`)
    .where('milestone.id', '==', milestone.id)
    .withConverter<Support>(converter(createSupport))
    .get()
  )
  // add supports of goal too
  supportsQueries.push(
    db.collection(`Goals/${goalId}/Supports`)
      .where('goal.id', '==', goalId)
      .where('milestone.id', '==', '')
      .withConverter<Support>(converter(createSupport))
      .get()
  )
  const supportsSnaps = await Promise.all(supportsQueries)

  for (const supportsSnap of supportsSnaps) {
    for (const snap of supportsSnap.docs) {
      const support = { ...snap.data() as Support, id: snap.id }
      const uid = support.supporter.uid
      const milestone = milestones.find(m => m.id === support.milestone.id)

      const supportNotification = createNotificationSupport({
        id: support.id,
        description: support.description,
        finished: !milestone.id,
        receiver: !!milestone.achiever.uid ? milestone.achiever : receiver
      })

      if (!!supporters[uid]) {
        supporters[uid].push(supportNotification)
      } else {
        supporters[uid] = [supportNotification]
      }
    }
  }

  const date = new Date()

  for (const [uid, supportNotifications] of Object.entries(supporters)) {
    const meta = createSupportDecisionMeta({
      deadline: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).toISOString(),
      supports: supportNotifications
    })

    const notification = createNotification({
      id: goalId,
      discussionId: goalId,
      event: enumEvent.gFinished,
      source: {
        image: goal.image,
        name: goal.title,
        goalId: goalId,
        postId: goalId
      },
      type: 'feed',
      message: [
        {
          text: 'Goal has been completed!'
        }
      ],
      meta,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    })
    db.doc(`Users/${uid}/Notifications/${goalId}`).set(notification)
  }
}

async function sendGoalFinishedNotificationToUserSpectators(goalId: string, goalTitle: string) {

  const stakeholdersSnap = await db.collection(`Goals/${goalId}/GStakeholders`).get()
  for (const doc of stakeholdersSnap.docs) {
    const stakeholder = createGoalStakeholder(doc.data())

    if (!stakeholder.isAdmin && !stakeholder.isAchiever) return

    const notification = createNotification({
      discussionId: goalId,
      event: enumEvent.gFinished,
      type: 'feed',
      source: {
        image: stakeholder.photoURL,
        name: stakeholder.username,
        userId: stakeholder.uid,
        goalId
      },
      message: [
        {
          text: stakeholder.username,
          link: `profile/${stakeholder.uid}`
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
    })
    sendNotificationToUserSpectators(stakeholder.uid, notification)
  }
}

async function sendNotificationFinishedGoalInCollectiveGoal(goalId: string, after: Goal) {

  if (!after.collectiveGoalId) return

  const collectiveGoalSnap = await db.doc(`CollectiveGoals/${after.collectiveGoalId}`).get()
  const collectiveGoal = createCollectiveGoal(collectiveGoalSnap.data());

  const notification: Partial<Notification> = {
    discussionId: goalId,
    event: enumEvent.gFinished,
    type: 'notification',
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

  return sendNotificationToCollectiveGoalStakeholders(after.collectiveGoalId, notification, true, true)
}

// ROADMAP CHANGED
function sendRoadmapChangedNotifications(discussionId: string, goalId: string, after: Goal) {

  const goalNotification: Partial<Notification> = {
    discussionId: discussionId,
    event: enumEvent.gRoadmapUpdated,
    type: 'feed',
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
    type: 'notification',
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
        text: `' has been changed. Go and checkout what the new plan is.`
      }
    ]
  }
  sendNotificationToGoalStakeholders(goalId, goalStakeholderNotification, true, true, true)
}

