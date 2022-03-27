import * as admin from 'firebase-admin';
import { logger } from 'firebase-functions';
// Functions
import { 
  addDiscussion,
  sendNotificationToGoal,
  sendNotificationToGoalStakeholders,
  sendNotificationToUsers,
  sendNotificationToUserSpectators
} from '../../../shared/notification/notification'

// Interfaces
import { enumEvent, Source } from '@strive/notification/+state/notification.firestore'
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createNotification } from '@strive/notification/+state/notification.model'
import { createGoalLink, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { createUserLink } from '@strive/user/user/+state/user.firestore'

const db = admin.firestore()
const { arrayUnion } = admin.firestore.FieldValue

export async function handleNotificationsOfStakeholderCreated(goal: Goal, stakeholder: GoalStakeholder) {

  // Adding admins and achievers to goal chat so they receive notifications
  if (stakeholder.isAdmin || stakeholder.isAchiever) {
    db.doc(`Discussions/${goal.id}`).update({
      commentators: arrayUnion(stakeholder.uid)
    })
  }

  // check if goal has other stakeholders
  if (!goal.numberOfAchievers && !goal.numberOfSupporters) return

  if (stakeholder.isAdmin) {
    sendNewAdminNotification(goal, stakeholder)
  }

  if (stakeholder.isAchiever) {
    sendNewAchieverNotificationInGoal(goal, stakeholder)

    if (stakeholder.goalPublicity === 'public') {
      sendNewAchieverNotificationToUserSpectators(goal, stakeholder)
    }
  }

  if (stakeholder.hasOpenRequestToJoin) {
    const discussionId = `RtjG${stakeholder.uid}${goal.id}`
    await sendNewRequestToJoinGoalNotificationInGoal(discussionId, goal, stakeholder)
  }

}

export async function handleNotificationsOfStakeholderChanged(goal: Goal, before: GoalStakeholder, after: GoalStakeholder) {

  const becameAdmin = !before.isAdmin && after.isAdmin
  const becameAchiever = !before.isAchiever && after.isAchiever

  // Adding admins and achievers to goal chat so they receive notifications
  if (becameAdmin || becameAchiever) {
    db.doc(`Discussions/${goal.id}`).update({
      commentators: arrayUnion(after.uid)
    })
  }

  if (becameAdmin) {
    sendNewAdminNotification(goal, after)
  }

  if (becameAchiever) {
    sendNewAchieverNotificationInGoal(goal, after)
      
    if (after.goalPublicity === 'public') {
      sendNewAchieverNotificationToUserSpectators(goal, after)
    }
  }

  // requests
  const discussionId = `RtjG${after.uid}${goal.id}`

  if (!before.hasOpenRequestToJoin && after.hasOpenRequestToJoin) {
    await sendNewRequestToJoinGoalNotificationInGoal(discussionId, goal, after)
  }

  if (before.hasOpenRequestToJoin && !after.hasOpenRequestToJoin) {
    if (!before.isAchiever && after.isAchiever) {
      // if stakeholder is now achiever, then request is accepted
      sendRequestToJoinGoalAcceptedNotification(discussionId, goal, after)
    } else {
      sendRequestToJoinGoalRejectedNotification(discussionId, goal, after)
    }
  }
}

// NEW ACHIEVER
function sendNewAchieverNotificationToUserSpectators(goal: Goal, stakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId: goal.id,
    event: enumEvent.gStakeholderAchieverAdded,
    type: 'feed',
    source: {
      user: createUserLink(stakeholder),
      goal: createGoalLink(goal)
    }
  })
  sendNotificationToUserSpectators(stakeholder.uid, notification)
}

function sendNewAchieverNotificationInGoal(goal: Goal, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId: goal.id,
    event: enumEvent.gStakeholderAchieverAdded,
    type: 'feed',
    source: {
      user: createUserLink(goalStakeholder),
      goal: createGoalLink(goal)
    },
  })
  sendNotificationToGoal(goal.id, notification)

  // send to all achievers and admins
  sendNotificationToGoalStakeholders(goal.id, notification, goalStakeholder.updatedBy, true, true, true)

}

function sendNewAdminNotification(goal: Goal, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId: goal.id,
    event: enumEvent.gStakeholderAdminAdded,
    type: 'feed',
    source: {
      goal: createGoalLink(goal),
      user: createUserLink(goalStakeholder)
    },
  })
  sendNotificationToGoal(goal.id, notification)

  sendNotificationToGoalStakeholders(goal.id, notification, goalStakeholder.updatedBy, true)

}

// REQUEST TO JOIN
async function sendNewRequestToJoinGoalNotificationInGoal(discussionId: string, goal: Goal, goalStakeholder: GoalStakeholder) {
  logger.log(`send 'New Request To Join Goal' Notification In Goal`)

  const source: Source = {
    goal: createGoalLink(goal),
    user: createUserLink(goalStakeholder)
  }

  await addDiscussion(`Request to become Achiever`, source, 'adminsAndRequestor', discussionId, goalStakeholder.uid)

  const goalStakeholdersNotification = createNotification({
    discussionId,
    event: enumEvent.gStakeholderRequestToJoinPending,
    type: 'notification',
    source
  })
  sendNotificationToGoalStakeholders(goal.id, goalStakeholdersNotification, goalStakeholder.uid, true)
}

function sendRequestToJoinGoalAcceptedNotification(discussionId: string, goal: Goal, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId,
    event: enumEvent.gStakeholderRequestToJoinAccepted,
    type: 'notification',
    source: {
      goal: createGoalLink(goal),
      user: createUserLink(goalStakeholder)
    }
  })
  sendNotificationToUsers(notification, [goalStakeholder.uid])
}

function sendRequestToJoinGoalRejectedNotification(discussionId: string, goal: Goal, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId,
    event: enumEvent.gStakeholderRequestToJoinRejected,
    type: 'notification',
    source: {
      goal: createGoalLink(goal),
      user: createUserLink(goalStakeholder)
    }
  })
  sendNotificationToUsers(notification, [goalStakeholder.uid])
}
