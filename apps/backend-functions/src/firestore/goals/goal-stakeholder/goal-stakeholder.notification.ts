import * as admin from 'firebase-admin';
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
import { createGoalRequest, createNotification } from '@strive/notification/+state/notification.model'
import { createGoalLink, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { createProfileLink } from '@strive/user/user/+state/user.firestore'

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
    sendNewAdminNotification(goal.id, stakeholder)
  }

  if (stakeholder.isAchiever) {
    sendNewAchieverNotificationInGoal(goal.id, stakeholder)

    if (stakeholder.goalPublicity === 'public') {
      sendNewAchieverNotificationToUserSpectators(goal.id, stakeholder)
    }
  }

  if (stakeholder.hasOpenRequestToJoin) {
    const discussionId = `RtjG${stakeholder.uid}${goal.id}`
    await sendNewRequestToJoinGoalNotificationInGoal(discussionId, goal.id, stakeholder)
  }

}

export async function handleNotificationsOfStakeholderChanged(goalId: string, before: GoalStakeholder, after: GoalStakeholder) {

  const becameAdmin = !before.isAdmin && after.isAdmin
  const becameAchiever = !before.isAchiever && after.isAchiever

  // Adding admins and achievers to goal chat so they receive notifications
  if (becameAdmin || becameAchiever) {
    db.doc(`Discussions/${goalId}`).update({
      commentators: arrayUnion(after.uid)
    })
  }

  if (becameAdmin) {
    sendNewAdminNotification(goalId, after)
  }

  if (becameAchiever) {
    sendNewAchieverNotificationInGoal(goalId, after)
      
    if (after.goalPublicity === 'public') {
      sendNewAchieverNotificationToUserSpectators(goalId, after)
    }
  }

  // requests
  const discussionId = `RtjG${after.uid}${goalId}`

  if (!before.hasOpenRequestToJoin && after.hasOpenRequestToJoin) {
    await sendNewRequestToJoinGoalNotificationInGoal(discussionId, goalId, after)
  }

  if (before.hasOpenRequestToJoin && !after.hasOpenRequestToJoin) {
    if (!before.isAchiever && after.isAchiever) {
      // if stakeholder is now achiever, then request is accepted
      sendRequestToJoinGoalAcceptedNotification(discussionId, goalId, after)
    } else {
      sendRequestToJoinGoalRejectedNotification(discussionId, goalId, after)
    }
  }
}

// NEW ACHIEVER
function sendNewAchieverNotificationToUserSpectators(goalId: string, stakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId: goalId,
    event: enumEvent.gStakeholderAchieverAdded,
    type: 'notification',
    source: {
      user: createProfileLink(stakeholder),
      goal: createGoalLink({
        id: goalId,
        title: stakeholder.goalTitle,
        image: stakeholder.goalImage
      })
    }
  })
  sendNotificationToUserSpectators(stakeholder.uid, notification)
}

function sendNewAchieverNotificationInGoal(goalId: string, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId: goalId,
    event: enumEvent.gStakeholderAchieverAdded,
    type: 'feed',
    source: {
      user: createProfileLink(goalStakeholder),
      goal: createGoalLink({
        id: goalId,
        title: goalStakeholder.goalTitle,
        image: goalStakeholder.goalImage
      })
    },
  })
  sendNotificationToGoal(goalId, notification)

  // send to all achievers and admins
  sendNotificationToGoalStakeholders(goalId, notification, goalStakeholder.updatedBy, true, true, true)

}

function sendNewAdminNotification(goalId: string, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId: goalId,
    event: enumEvent.gStakeholderAdminAdded,
    type: 'feed',
    source: {
      goal: createGoalLink({
        id: goalId,
        title: goalStakeholder.goalTitle,
        image: goalStakeholder.goalImage
      }),
      user: createProfileLink(goalStakeholder)
    },
  })
  sendNotificationToGoal(goalId, notification)

  sendNotificationToGoalStakeholders(goalId, notification, goalStakeholder.updatedBy, true)

}

// REQUEST TO JOIN
async function sendNewRequestToJoinGoalNotificationInGoal(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder) {
  console.log(`send 'New Request To Join Goal' Notification In Goal`)

  const source: Source = {
    goal: createGoalLink({
      id: goalId,
      title: goalStakeholder.goalTitle,
      image: goalStakeholder.goalImage
    }),
    user: createProfileLink(goalStakeholder)
  }

  await addDiscussion(`Request to become Achiever`, source, 'adminsAndRequestor', discussionId, goalStakeholder.uid)

  // Send request to admins only
  const meta = createGoalRequest({ uidRequestor: goalStakeholder.uid })

  const goalStakeholdersNotification = createNotification({
    discussionId,
    event: enumEvent.gStakeholderRequestToJoinPending,
    type: 'feed',
    source,
    meta
  })
  sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, goalStakeholder.uid, true)
}

function sendRequestToJoinGoalAcceptedNotification(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId,
    event: enumEvent.gStakeholderRequestToJoinAccepted,
    type: 'notification',
    source: {
      goal: createGoalLink({
        id: goalId,
        title: goalStakeholder.goalTitle,
        image: goalStakeholder.goalImage
      }),
      user: createProfileLink(goalStakeholder)
    }
  })
  sendNotificationToUsers(notification, [goalStakeholder.uid])
}

function sendRequestToJoinGoalRejectedNotification(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId,
    event: enumEvent.gStakeholderRequestToJoinRejected,
    type: 'notification',
    source: {
      goal: createGoalLink({
        id: goalId,
        title: goalStakeholder.goalTitle,
        image: goalStakeholder.goalImage
      }),
      user: createProfileLink(goalStakeholder)
    }
  })
  sendNotificationToUsers(notification, [goalStakeholder.uid])
}
