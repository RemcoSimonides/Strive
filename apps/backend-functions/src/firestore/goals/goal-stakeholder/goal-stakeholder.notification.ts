// Functions
import { 
  sendNotificationToGoal,
  sendNotificationToGoalStakeholders,
  sendNotificationToUsers,
  sendNotificationToUserSpectators,
  createDiscussion
} from '../../../shared/notification/notification'

// Interfaces
import { Notification, enumEvent } from '@strive/notification/+state/notification.firestore'
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createGoalRequest, createNotification } from '@strive/notification/+state/notification.model'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'

export async function handleNotificationsOfStakeholderCreated(goal: Goal, stakeholder: GoalStakeholder) {

  // check if goal has collective goal
  if (!goal.numberOfAchievers && !goal.numberOfSupporters) return

  if (stakeholder.isAdmin) {
    // const discussionId = await createDiscussion('public')
    sendNewAdminNotificationInGoal(goal.id, goal.id, stakeholder)
  }

  if (stakeholder.isAchiever) {
    // const discussionId = await createDiscussion()
    sendNewAchieverNotificationInGoal(goal.id, goal.id, stakeholder)

    if (stakeholder.goalPublicity === 'public') {
      sendNewAchieverNotificationToUserSpectators(goal.id, goal.id, stakeholder)
    }
  }

  if (stakeholder.isSupporter) {
    // const discussionId = await createDiscussion()
    sendNewSupporterNotificationInGoal(goal.id, goal.id, stakeholder)

    if (stakeholder.goalPublicity === 'public') {
      // No need for notification about this
      // sendNewSupporterNotificationToUserSpectators(goalId, goalId, stakeholder)
    }
  }

  if (stakeholder.hasOpenRequestToJoin) {
    const discussionId = await createDiscussion(`Request to become Achiever`, { image: stakeholder.goalImage, name: `Request to join ${stakeholder.goalTitle}`, goalId: stakeholder.goalId }, 'adminsAndRequestor', undefined, stakeholder.uid)
    await sendNewRequestToJoinGoalNotificationInGoal(discussionId, goal.id, stakeholder)
  }

}

export async function handleNotificationsOfStakeholderChanged(goalId: string, before: GoalStakeholder, after: GoalStakeholder) {

  if (!before.isAdmin && after.isAdmin) {
    sendNewAdminNotificationInGoal(goalId, goalId, after)
  }

  if (!before.isAchiever && after.isAchiever) {
    sendNewAchieverNotificationInGoal(goalId, goalId, after)
      
    if (after.goalPublicity === 'public') {
      sendNewAchieverNotificationToUserSpectators(goalId, goalId, after)
    }
  }

  if (!before.isSupporter && after.isSupporter) {
    sendNewSupporterNotificationInGoal(goalId, goalId, after)

    if (after.goalPublicity === 'public') {
      // No need for notification about this
      // sendNewSupporterNotificationToUserSpectators(goalId, goalId, after)
    }
  }

  // requests
  const discussionId = `RtjG${after.uid}${goalId}`

  if (!before.hasOpenRequestToJoin && after.hasOpenRequestToJoin) {
    await createDiscussion(`Request to become Achiever`, { image: after.goalImage, name: `Request to join ${after.goalTitle}`, goalId: after.goalId }, 'adminsAndRequestor', discussionId, after.uid)
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
function sendNewAchieverNotificationToUserSpectators(discussionId: string, goalId: string, stakeholder: GoalStakeholder) {

  const notification: Partial<Notification> = {
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
  sendNotificationToUserSpectators(stakeholder.uid, notification)
}

function sendNewAchieverNotificationInGoal(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder) {

  const goalNotification = createNotification({
    discussionId: discussionId,
    event: enumEvent.gStakeholderAchieverAdded,
    type: 'feed',
    source: {
      image: goalStakeholder.photoURL,
      name: goalStakeholder.username,
      userId: goalStakeholder.uid,
      goalId: goalId
    },
    message: [
      {
        text: `Joined as an Achiever!`
      },
    ]
  })
  sendNotificationToGoal(goalId, goalNotification)

  const goalStakeholdersNotification = createNotification({
    discussionId: discussionId,
    event: enumEvent.gStakeholderAchieverAdded,
    type: 'notification',
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
        text: ` joined as an Achiever`
      }
    ]    
  })

  // send to all achievers and admins
  sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true, true, true)

}

function sendNewSupporterNotificationInGoal(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder) {

  const goalNotification = createNotification({
    discussionId: discussionId,
    event: enumEvent.gStakeholderSupporterAdded,
    type: 'feed',
    source:  {
      image: goalStakeholder.photoURL,
      name: goalStakeholder.username,
      userId: goalStakeholder.uid,
      goalId: goalId
    },
    message: [
      {
        text: `Joined as a Supporter 🥳`
      },
    ]
  })
  sendNotificationToGoal(goalId, goalNotification)

  const goalStakeholdersNotification = createNotification({
    discussionId: discussionId,
    event: enumEvent.gStakeholderSupporterAdded,
    type: 'notification',
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
        text: ` is now supporting 🥳`
      }
    ]
  })
  sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true, true, true)

}

// NEW ADMIN
function sendNewAdminNotificationInGoal(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder) {

  const goalNotification = createNotification({
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
  })
  sendNotificationToGoal(goalId, goalNotification)

  const goalStakeholdersNotification = createNotification({
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
  })
  sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true)

}

// REQUEST TO JOIN
async function sendNewRequestToJoinGoalNotificationInGoal(discussionId: string, goalId: string,  goalStakeholder: GoalStakeholder) {
  console.log(`send 'New Request To Join Goal' Notification In Goal`)

  // Send request to admins only
  const meta = createGoalRequest({ uidRequestor: goalStakeholder.uid })

  const goalStakeholdersNotification = createNotification({
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
      type: 'feed',
      meta
  })
  sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true)
}

function sendRequestToJoinGoalAcceptedNotification(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
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
  })
  sendNotificationToUsers(notification, [goalStakeholder.uid])
}

function sendRequestToJoinGoalRejectedNotification(discussionId: string, goalId: string, goalStakeholder: GoalStakeholder) {

  const notification = createNotification({
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
  })
  sendNotificationToUsers(notification, [goalStakeholder.uid])
}
