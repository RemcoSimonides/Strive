import * as admin from 'firebase-admin'
// Functions
import { sendNotificationToGoal, sendNotificationToGoalStakeholders } from '../../../shared/notification/notification'
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { enumEvent} from '@strive/notification/+state/notification.firestore'
import { getReceiver } from '../../../shared/support/receiver'
import { createGoal, createGoalLink, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { createMilestoneLink, Milestone } from '@strive/goal/milestone/+state/milestone.firestore'
import { createNotification, createSupportDecisionMeta } from '@strive/notification/+state/notification.model';
import { createNotificationSupport, createSupport, NotificationSupport } from '@strive/support/+state/support.firestore';
import { createUserLink, UserLink } from '@strive/user/user/+state/user.firestore';
import { getDocument } from 'apps/backend-functions/src/shared/utils';

const db = admin.firestore()

export async function handleStatusChangeNotification(before: Milestone, after: Milestone, goalId: string, milestoneId: string) {

  // Get goal data for the title
  const goalSnap = await db.doc(`Goals/${goalId}`).get()
  const goal = createGoal(goalSnap.data())

  if (before.status !== 'pending') return;
  if (after.status === 'overdue') {
    // send overdue notification
    // TODO this never happens because this is checked before this function is called
  }

  if (after.status !== 'succeeded' && after.status !== 'failed') return;

  const user = await getDocument(`Users/${after.updatedBy}`).then(user => createUserLink(user))

  // send notification to every stakeholder
  if (after.status === 'succeeded') {
    await sendNotificationMilestoneSuccessful(goalId, milestoneId, goal, after, user)
  } else if (after.status === 'failed') {
    await sendNotificationMilestoneFailed(goalId, milestoneId, goal, after, user)
  }

  // send notification to supporters of this milestone
  // overwrite notification to supporters // send notification if person does not want milestone notifications but does support them
  const supporters: Record<string, NotificationSupport[]> = {}
  const receiver: UserLink = after.achiever.uid ? after.achiever : await getReceiver(goalId, db)

  // get supports
  const supportsSnap = await db.collection(`Goals/${goalId}/Supports`).where('milestone.id', '==', after.id).get()
  for (const snap of supportsSnap.docs) {
    const support = createSupport({ ...snap.data(), id: snap.id })
    const uid = support.supporter.uid

    const supportNotification = createNotificationSupport({
      id: support.id,
      description: support.description,
      receiver: after.achiever.uid ? after.achiever : receiver 
    })

    if (supporters[uid]) {
      supporters[uid].push(supportNotification)
    } else {
      supporters[uid] = [supportNotification]
    }
  }

  const timestamp = admin.firestore.FieldValue.serverTimestamp()

  for (const [uid, supportNotifications] of Object.entries(supporters)) {
    const meta = createSupportDecisionMeta({
      supports: supportNotifications
    })

    const notification = createNotification({
      id: milestoneId,
      discussionId: milestoneId,
      event: after.status === 'succeeded' ? enumEvent.gSupportPendingSuccesful : enumEvent.gSupportPendingFailed,
      type: 'feed',
      target: 'stakeholder',
      source: {
        goal: createGoalLink({
          id: goalId,
          ...goal
        }),
        milestone: createMilestoneLink({
          id: milestoneId,
          ...after
        }),
        user,
        postId: milestoneId
      },
      isRead: false,
      meta,
      createdAt: timestamp as Timestamp,
      updatedAt: timestamp as Timestamp
    })
    db.doc(`Users/${uid}/Notifications/${milestoneId}`).set(notification)
  }
}

// Milestone successful
function sendNotificationMilestoneSuccessful(goalId: string, milestoneId: string, goal: Goal, milestone: Milestone, user: UserLink) {
  const notification = createNotification({
    id: milestoneId,
    discussionId: milestoneId,
    event: enumEvent.gMilestoneCompletedSuccessfully,
    type: 'feed',
    source: {
      goal: createGoalLink({
        id: goalId,
        ...goal
      }),
      milestone: createMilestoneLink({
        id: milestoneId,
        ...milestone
      }),
      user,
      postId: milestoneId
    }
  })
  sendNotificationToGoal(goalId, notification)

  return sendNotificationToGoalStakeholders(goalId, notification, milestone.updatedBy, true, true, true)
}

// Milestone failed
function sendNotificationMilestoneFailed(goalId: string, milestoneId: string, goal: Goal, milestone: Milestone, user: UserLink) {
  const notification = createNotification({
    id: milestoneId,
    discussionId: milestoneId,
    event: enumEvent.gMilestoneCompletedUnsuccessfully,
    type: 'feed',
    source: {
      goal: createGoalLink({
        id: goalId,
        ...goal
      }),
      milestone: createMilestoneLink({
        id: milestoneId,
        ...milestone
      }),
      user,
      postId: milestoneId
    }
  })
  sendNotificationToGoal(goalId, notification)

  return sendNotificationToGoalStakeholders(goalId, notification, milestone.updatedBy, true, true, true)
}
