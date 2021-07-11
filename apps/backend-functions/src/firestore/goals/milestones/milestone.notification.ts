import * as admin from 'firebase-admin'
// Functions
import { sendNotificationToGoal, sendNotificationToGoalStakeholders } from '../../../shared/notification/notification'
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { enumEvent} from '@strive/notification/+state/notification.firestore'
import { getReceiver } from '../../../shared/support/receiver'
import { createGoal, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { createMilestone, Milestone } from '@strive/milestone/+state/milestone.firestore'
import { createNotification, createSupportDecisionMeta, increaseSeqnoByOne } from '@strive/notification/+state/notification.model';
import { createNotificationSupport, NotificationSupport, Support } from '@strive/support/+state/support.firestore';
import { ProfileLink } from '@strive/user/user/+state/user.firestore';
import { converter } from 'apps/backend-functions/src/shared/utils';

const db = admin.firestore()

export async function handleStatusChangeNotification(before: Milestone, after: Milestone, goalId: string, milestoneId: string) {

  // Get goal data for the title
  const goalSnap = await db.doc(`Goals/${goalId}`).get()
  const goal = createGoal(goalSnap.data())

  if (before.status !== 'pending') return;
  if (after.status === 'neutral') return;
  if (after.status === 'overdue') {
    // send overdue notification
    // TODO this never happens because this is checked before this function is called
  }

  if (after.status !== 'succeeded' && after.status !== 'failed') return;

  // send notification to every stakeholder
  if (after.status === 'succeeded') {
    sendNotificationMilestoneSuccessful(goalId, milestoneId, goal, after)
  } else if (after.status === 'failed') {
    sendNotificationMilestoneFailed(goalId, milestoneId, goal, after)
  }

  // send notification to supporters of this milestone and submilestones 
  // overwrite notification to supporters // send notification if person does not want level 1/2/3 milestone notifications but does support them
  const supporters: Record<string, NotificationSupport[]> = {}
  const receiver: ProfileLink = !!after.achiever.uid ? after.achiever : await getReceiver(goalId, db)

  // get milestones (including unfinished submilestones)
  const milestones: Milestone[] = [after]

  const oneSeqnoHigher = increaseSeqnoByOne(after.sequenceNumber)
  const subMilestonesSnap = await db.collection(`Goals/${goalId}/Milestones`)
    .where('status', '==', 'pending')
    .where('sequenceNumber', '>', after.sequenceNumber)
    .where('sequenceNumber', '<', oneSeqnoHigher)
    .withConverter<Milestone>(converter(createMilestone))
    .get()

  for (const snap of subMilestonesSnap.docs) {
    milestones.push(snap.data())
  }
  
  // get supports
  const supportsQuery = milestones.map(milestone => db.collection(`Goals/${goalId}/Supports`)
    .where('milestone.id', '==', milestone.id)
    // .withConverter<Support>(converter(createSupport))
    .get()
  )
  const supportsPerMilestoneSnap = await Promise.all(supportsQuery)

  for (const supportsSnap of supportsPerMilestoneSnap) {
    for (const snap of supportsSnap.docs) {
      const support = { ...snap.data() as Support, id: snap.id };
      const uid = support.supporter.uid
      const milestone = milestones.find(m => m.id === support.milestone.id)

      const supportNotification = createNotificationSupport({
        id: support.id,
        description: support.description,
        finished: support.milestone.id === after.id,
        receiver: !!milestone.achiever.uid ? milestone.achiever : receiver 
      })

      if (!!supporters[uid]) {
        supporters[uid].push(supportNotification)
      } else {
        supporters[uid] = [supportNotification]
      }
    }
  }

  const timestamp = admin.firestore.FieldValue.serverTimestamp()
  const date = new Date()
  const text = `Milestone '${after.description}' ${after.status === 'succeeded' ? 'is successfully completed &#127881;' : 'has failed to complete'}`

  for (const [uid, supportNotifications] of Object.entries(supporters)) {
    const meta = createSupportDecisionMeta({
      deadline: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).toISOString(),
      supports: supportNotifications
    })

    const notification = createNotification({
      id: milestoneId,
      discussionId: milestoneId,
      event: enumEvent.gSupportStatusChangedToPending,
      source: {
        image: goal.image,
        name: goal.title,
        goalId,
        milestoneId,
        postId: milestoneId
      },
      type: 'feed',
      message: [
        {
          text
        }
      ],
      isRead: false,
      meta,
      createdAt: timestamp as Timestamp,
      updatedAt: timestamp as Timestamp
    })
    db.doc(`Users/${uid}/Notifications/${milestoneId}`).set(notification)
  }
}

// Milestone successful
function sendNotificationMilestoneSuccessful(goalId: string, milestoneId: string, goal: Goal, milestone: Milestone) {

  const goalNotification = createNotification({
    discussionId: milestoneId,
    event: enumEvent.gMilestoneCompletedSuccessfully,
    type: 'feed',
    source: {
      image: goal.image,
      name: goal.title,
      goalId: goalId,
      milestoneId: milestoneId,
      postId: milestoneId
    },
    message: [
      {
        text: `Milestone '${milestone.description}' is successfully completed`
      }
    ],
  })
  sendNotificationToGoal(goalId, goalNotification)

  const goalStakeholdersNotification = createNotification({
    id: milestoneId,
    discussionId: milestoneId,
    event: enumEvent.gMilestoneCompletedSuccessfully,
    type: 'feed',
    source: {
      image: goal.image,
      name: goal.title,
      goalId: goalId,
      milestoneId: milestoneId,
      postId: milestoneId
    },
    message: [
      {
        text: `Milestone '${milestone.description}' is successfully completed`
      }
    ]
  })
  sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true, true, true)
}

// Milestone failed
function sendNotificationMilestoneFailed(goalId: string, milestoneId: string, goal: Goal, milestone: Milestone) {

  const goalNotification = createNotification({
    discussionId: milestoneId,
    event: enumEvent.gMilestoneCompletedUnsuccessfully,
    type: 'feed',
    source: {
      image: goal.image,
      name: goal.title,
      goalId: goalId,
      milestoneId: milestoneId,
      postId: milestoneId
    },
    message: [
      {
        text: `Milestone '${milestone.description}' failed to completed'`
      }
    ]
  })
  sendNotificationToGoal(goalId, goalNotification)

  const goalStakeholdersNotification = createNotification({
    discussionId: milestoneId,
    event: enumEvent.gMilestoneCompletedUnsuccessfully,
    type: 'feed',
    source:  {
      image: goal.image,
      name: goal.title,
      goalId: goalId,
      milestoneId: milestoneId,
      postId: milestoneId
    },
    message: [
      {
        text: `Milestone '${milestone.description}' failed to complete`
      }
    ]
  })
  sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification, true, true, true)
}
