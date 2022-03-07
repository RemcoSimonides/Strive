import * as admin from 'firebase-admin'
import * as moment from 'moment'
import { logger } from 'firebase-functions'
// Functions
import { 
  sendNotificationToGoal,
  sendNotificationToGoalStakeholders,
  sendNotificationToCollectiveGoalStakeholders,
  sendNotificationToUserSpectators,
  addDiscussion
} from '../../shared/notification/notification'
import { getReceiver } from '../../shared/support/receiver'
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { enumEvent, Source } from '@strive/notification/+state/notification.firestore'
import { createGoalLink, getAudience, Goal, GoalStatus } from '@strive/goal/goal/+state/goal.firestore'
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createNotificationSupport, createSupport, NotificationSupport, Support } from '@strive/support/+state/support.firestore';
import { createNotification, createSupportDecisionMeta } from '@strive/notification/+state/notification.model';
import { createCollectiveGoal, createCollectiveGoalLink } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { createUserLink, UserLink } from '@strive/user/user/+state/user.firestore';
import { createMilestone, Milestone } from '@strive/goal/milestone/+state/milestone.firestore';
import { converter, getDocument } from '../../shared/utils';

const db = admin.firestore()
const { serverTimestamp } = admin.firestore.FieldValue

export async function handleNotificationsOfCreatedGoal(goalId: string, goal: Goal): Promise<void> {
  logger.log('executting handle notification of created goal')

  const source: Source = {
    goal: createGoalLink({ ...goal, id: goalId })
  }
  const audience = getAudience(goal.publicity)
  await addDiscussion(`General discussion`, source, audience, goalId)

  // New Goal
  if (goal.collectiveGoalId && (goal.publicity === 'public' || goal.publicity === 'collectiveGoalOnly')) {
    sendNewGoalNotificationInCollectiveGoal(goalId, goal)
  }

  sendNewGoalNotification(goalId, goal)
}

export async function handleNotificationsOfChangedGoal(goalId: string, before: Goal, after: Goal): Promise<void> {
  logger.log('executing handle notification of changed goal')

  // finished goal
  if (before.status !== 'finished' && after.status === 'finished') {
  
    // Send finished goal notification to admins and achievers (no supporters)
    sendFinishedGoalNotification(goalId, after)
    // Send finished goal notification to Supporters
    sendFinishedGoalNotificationToSupporter(goalId, after)

    if (after.collectiveGoalId) {
      if (after.publicity === 'public' || after.publicity === 'collectiveGoalOnly') {
        sendNotificationFinishedGoalInCollectiveGoal(goalId, after)
      }
    }
  }

  // new (public) goal in collective goal
  if (before.publicity === 'private' && (after.publicity === 'public' || after.publicity === 'collectiveGoalOnly')) {
    if (after.collectiveGoalId) {
      sendNewGoalNotificationInCollectiveGoal(goalId, after)
    }
  }

  // Roadmap changed
  if (JSON.stringify(before.roadmapTemplate) !== JSON.stringify(after.roadmapTemplate)) {

    const momentBefore = moment(before.updatedAt)
    const momentAfter = moment(after.updatedAt)
    const isEarlierThanDayAgo = momentBefore.add(1, 'day').isAfter(momentAfter)
    
    if (!isEarlierThanDayAgo) {
      sendRoadmapChangedNotifications(goalId, after)
    }
  }
}

// NEW GOAL NOTIFICATION
async function sendNewGoalNotification(goalId: string, goal: Goal) {
  logger.log(`Sending New Goal Notification to Goal`)

  const event: Record<GoalStatus, enumEvent> = {
    bucketlist: enumEvent.gNewBucketlist,
    active: enumEvent.gNewActive,
    finished: enumEvent.gNewFinished
  }

  const notification = createNotification({
    discussionId: goalId,
    event: event[goal.status],
    type: 'feed',
    source: {
      goal: createGoalLink({ ...goal, id: goalId })
    }
  })
  sendNotificationToGoal(goalId, notification)

  if (goal.publicity === 'public') {

    logger.log(`Sending New Goal Notification to User Spectators`)
    const goalStakeholderColSnap = await db.collection(`Goals/${goalId}/GStakeholders`).get()
    for (const snap of goalStakeholderColSnap.docs) {
      notification.source.user = createUserLink({ ...snap.data(), uid: snap.id })
      sendNotificationToUserSpectators(snap.id, notification)
    }
  }
}

async function sendNewGoalNotificationInCollectiveGoal(goalId: string, goal: Goal) {

  if (!goal.collectiveGoalId) return
  logger.log(`Sending New Goal Notification to Collective Goal (${goal.collectiveGoalId}) stakeholders`)

  const collectiveGoalSnap = await db.doc(`CollectiveGoals/${goal.collectiveGoalId}`).get()
  const collectiveGoal = createCollectiveGoal({ ...collectiveGoalSnap.data(), id: collectiveGoalSnap.id });

  const notification = createNotification({
    discussionId: goalId,
    event: enumEvent.cgGoalCreated,
    type: 'notification',
    source: {
      goal: createGoalLink({ ...goal, id: goalId }),
      collectiveGoal: createCollectiveGoalLink({
        ...collectiveGoal,
        id: goal.collectiveGoalId
      })
    }
  })

  return sendNotificationToCollectiveGoalStakeholders(goal.collectiveGoalId, notification, goal.updatedBy, true, true)
}

// FINISHED GOAL
async function sendFinishedGoalNotification(goalId: string, goal: Goal) {
  const user = await getDocument(`Users/${goal.updatedBy}`).then(user => createUserLink(user))

  const notification = createNotification({
    discussionId: goalId,
    event: enumEvent.gFinished,
    type: 'feed',
    source: {
      goal: createGoalLink({ ...goal, id: goalId }),
      postId: goalId,
      user
    },
  })
  sendNotificationToGoal(goalId, notification)

  sendNotificationToGoalStakeholders(goalId, notification, '', true, true, false)

  if (goal.publicity === 'public') {
    const stakeholdersSnap = await db.collection(`Goals/${goalId}/GStakeholders`).get()
    for (const doc of stakeholdersSnap.docs) {
      const stakeholder = createGoalStakeholder({ ...doc.data(), uid: doc.id })
  
      if (!stakeholder.isAdmin && !stakeholder.isAchiever) return
  
      notification.source.user = createUserLink(stakeholder)
      sendNotificationToUserSpectators(stakeholder.uid, notification)
    }
  }
}

async function sendFinishedGoalNotificationToSupporter(goalId: string, goal: Goal) {

  const supporters: Record<string, NotificationSupport[]> = {}
  const [ receiver, updatedBy ] = await Promise.all([
    getReceiver(goalId, db),
    getDocument<UserLink>(`Users/${goal.updatedBy}`)
  ])

  // get unfinished milestones and then its supports
  const milestonesSnap = await db.collection(`Goals/${goalId}/Milestones`)
    .where('status', '==', 'pending')
    .withConverter<Milestone>(converter(createMilestone))
    .get()
  const milestones = milestonesSnap.docs.map(snap => ({...snap.data(), id: snap.id }))

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
      const support = createSupport({ ...snap.data(), id: snap.id })
      const uid = support.supporter.uid
      const milestone = milestones.find(m => m.id === support.milestone.id)

      const supportNotification = createNotificationSupport({
        id: support.id,
        description: support.description,
        finished: !milestone.id,
        receiver: milestone.achiever.uid ? milestone.achiever : receiver
      })

      if (supporters[uid]) {
        supporters[uid].push(supportNotification)
      } else {
        supporters[uid] = [supportNotification]
      }
    }
  }

  for (const [uid, supportNotifications] of Object.entries(supporters)) {
    const meta = createSupportDecisionMeta({
      supports: supportNotifications
    })

    const notification = createNotification({
      id: goalId,
      discussionId: goalId,
      event: enumEvent.gFinished,
      target: 'stakeholder',
      type: 'feed',
      source: {
        goal: createGoalLink({ ...goal, id: goalId }),
        postId: goalId,
        user: updatedBy
      },
      meta,
      createdAt: serverTimestamp() as Timestamp,
      updatedAt: serverTimestamp() as Timestamp
    })
    db.doc(`Users/${uid}/Notifications/${goalId}`).set(notification)
  }
}

async function sendNotificationFinishedGoalInCollectiveGoal(goalId: string, after: Goal) {

  if (!after.collectiveGoalId) return

  const collectiveGoalSnap = await db.doc(`CollectiveGoals/${after.collectiveGoalId}`).get()
  const collectiveGoal = createCollectiveGoal(collectiveGoalSnap.data());

  const notification = createNotification({
    discussionId: goalId,
    event: enumEvent.cgGoalFinised,
    type: 'notification',
    source: {
      collectiveGoal: createCollectiveGoalLink({ ...collectiveGoal, id: after.collectiveGoalId }),
      goal: createGoalLink({ ...after, id: goalId }),
      postId: goalId
    }
  })

  return sendNotificationToCollectiveGoalStakeholders(after.collectiveGoalId, notification, after.updatedBy, true, true)
}

// ROADMAP CHANGED
function sendRoadmapChangedNotifications(goalId: string, goal: Goal) {

  const notification = createNotification({
    discussionId: goalId,
    event: enumEvent.gRoadmapUpdated,
    type: 'feed',
    source: {
      goal: createGoalLink({ ...goal, id: goalId })
    }
  })
  sendNotificationToGoal(goalId, notification)

  sendNotificationToGoalStakeholders(goalId, notification, goal.updatedBy, true, true, true)
}

