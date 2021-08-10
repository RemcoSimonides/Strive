// Functions
import { 
  sendNotificationToGoal,
  sendNotificationToGoalStakeholders,
  sendNotificationToUsers,
  sendNotificationToUserSpectators
} from '../../../shared/notification/notification'

// Interfaces
import { enumEvent } from '@strive/notification/+state/notification.firestore'
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createGoalRequest, createNotification } from '@strive/notification/+state/notification.model'
import { createGoalLink, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { createProfileLink } from '@strive/user/user/+state/user.firestore'

export async function handleNotificationsOfStakeholderCreated(goal: Goal, stakeholder: GoalStakeholder) {

  // check if goal has collective goal
  if (!goal.numberOfAchievers && !goal.numberOfSupporters) return

  if (stakeholder.isAdmin) {
    // const discussionId = await createDiscussion('public')
    sendNewAdminNotificationInGoal(goal.id, stakeholder)
  }

  if (stakeholder.isAchiever) {
    // const discussionId = await createDiscussion()
    sendNewAchieverNotificationInGoal(goal.id, stakeholder)

    if (stakeholder.goalPublicity === 'public') {
      sendNewAchieverNotificationToUserSpectators(goal.id, stakeholder)
    }
  }

  if (stakeholder.isSupporter) {
    // const discussionId = await createDiscussion()
    sendNewSupporterNotificationInGoal(goal.id, stakeholder)

    if (stakeholder.goalPublicity === 'public') {
      // No need for notification about this
      // sendNewSupporterNotificationToUserSpectators(goalId, goalId, stakeholder)
    }
  }

  if (stakeholder.hasOpenRequestToJoin) {
    // const discussionId = await createDiscussion(`Request to become Achiever`, { image: stakeholder.goalImage, name: `Request to join ${stakeholder.goalTitle}`, goalId: stakeholder.goalId }, 'adminsAndRequestor', undefined, stakeholder.uid)
    await sendNewRequestToJoinGoalNotificationInGoal('invalid', goal.id, stakeholder)
  }

}

export async function handleNotificationsOfStakeholderChanged(goalId: string, before: GoalStakeholder, after: GoalStakeholder) {

  if (!before.isAdmin && after.isAdmin) {
    sendNewAdminNotificationInGoal(goalId, after)
  }

  if (!before.isAchiever && after.isAchiever) {
    sendNewAchieverNotificationInGoal(goalId, after)
      
    if (after.goalPublicity === 'public') {
      sendNewAchieverNotificationToUserSpectators(goalId, after)
    }
  }

  if (!before.isSupporter && after.isSupporter) {
    sendNewSupporterNotificationInGoal(goalId, after)

    if (after.goalPublicity === 'public') {
      // No need for notification about this
      // sendNewSupporterNotificationToUserSpectators(goalId, goalId, after)
    }
  }

  // requests
  const discussionId = `RtjG${after.uid}${goalId}`

  if (!before.hasOpenRequestToJoin && after.hasOpenRequestToJoin) {
    // await createDiscussion(`Request to become Achiever`, { image: after.goalImage, name: `Request to join ${after.goalTitle}`, goalId: after.goalId }, 'adminsAndRequestor', discussionId, after.uid)
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

function sendNewSupporterNotificationInGoal(goalId: string, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
    discussionId: goalId,
    event: enumEvent.gStakeholderSupporterAdded,
    type: 'feed',
    source:  {
      user: createProfileLink(goalStakeholder),
      goal: createGoalLink({
        id: goalId,
        title: goalStakeholder.goalTitle,
        image: goalStakeholder.goalImage
      })
    }
  })
  sendNotificationToGoal(goalId, notification)

  sendNotificationToGoalStakeholders(goalId, notification, goalStakeholder.uid, true, true, true)

}

// NEW ADMIN
function sendNewAdminNotificationInGoal(goalId: string, goalStakeholder: GoalStakeholder) {

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
async function sendNewRequestToJoinGoalNotificationInGoal(discussionId: string, goalId: string,  goalStakeholder: GoalStakeholder) {
  console.log(`send 'New Request To Join Goal' Notification In Goal`)

  // Send request to admins only
  const meta = createGoalRequest({ uidRequestor: goalStakeholder.uid })

  const goalStakeholdersNotification = createNotification({
    discussionId,
    event: enumEvent.gStakeholderRequestToJoinPending,
    type: 'feed',
    source: {
      goal: createGoalLink({
        id: goalId,
        title: goalStakeholder.goalTitle,
        image: goalStakeholder.goalImage
      }),
      user: createProfileLink(goalStakeholder)
    },
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
