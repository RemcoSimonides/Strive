import * as admin from 'firebase-admin'
// Functions
import { sendNotificationToGoal, sendNotificationToGoalStakeholders } from '../../../shared/notification/notification'
import { _increaseSeqnoByOne } from './milestone'
// Interfaces
import { Timestamp } from '@firebase/firestore-types';
import { enumEvent} from '@strive/notification/+state/notification.firestore'
import { IReceiver, getReceiver } from '../../../shared/support/receiver'
import { createGoal, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { Milestone, enumMilestoneStatus } from '@strive/milestone/+state/milestone.firestore'
import { createNotification, createSupportDecisionMeta, SupportDecisionNotification } from '@strive/notification/+state/notification.model';

const db = admin.firestore()

export async function handleStatusChangeNotification(before: Milestone, after: Milestone, goalId: string, milestoneId: string) {

  // Get goal data for the title
  const goalRef = db.doc(`Goals/${goalId}`)
  const goalSnap = await goalRef.get()
  const goal =  createGoal(goalSnap.data())

  // send notification to every stakeholder
  if (before.status === enumMilestoneStatus.pending  && after.status === enumMilestoneStatus.succeeded) {
    sendNotificationMilestoneSuccessful(goalId, milestoneId, goal, after)
  } else if (before.status === enumMilestoneStatus.pending && after.status === enumMilestoneStatus.failed) {
    sendNotificationMilestoneFailed(goalId, milestoneId, goal, after)
  }

  // send message to supporters (including the supports)
  // overwrite notification to supporters // send notification if person does not want level 1/2/3 milestone notifications but does support them
  const startText = `Milestone '${after.description}'`
  let endText = ''
  if (before.status === enumMilestoneStatus.pending && after.status === enumMilestoneStatus.succeeded) { 
    endText = ` is successfully completed &#127881;`
  } else if (before.status === enumMilestoneStatus.pending && after.status === enumMilestoneStatus.failed) {
    endText = ` has failed to complete`
  }

  //Send notification to supporters of this milestone
  let supporters: any = {}
  let receiver = <IReceiver>{}

  if (!!after.achiever.uid) {
    // achiever is assigned to milestone
    receiver.id = after.achiever.uid
    receiver.username = after.achiever.username || ''
    receiver.photoURL = after.achiever.photoURL || ''
  } else {
    // receiver is only achiever OR receiver object with NULL
    receiver = await getReceiver(goalId, db)
  }

  const supportsColRef = db.collection(`Goals/${goalId}/Supports`).where('milestone.id', '==', milestoneId)
  const supportsColSnap = await supportsColRef.get()
  supportsColSnap.forEach(supportSnap => {

    const support = supportSnap.data();
    const supporterUID = support.supporter.uid
    const supportId = supportSnap.id

    if (!(supporterUID in supporters)) supporters[supporterUID] = {}
    if (!(supportId in supporters[supporterUID])) supporters[supporterUID][supportId] = {}

    supporters[supporterUID][supportId] = {
      description: support.description,
      milestoneIsFinished: true,
      receiverId: receiver ? receiver.id : null,
      receiverUsername: receiver ? receiver.username : null,
      receiverPhotoURL: receiver ? receiver.photoURL : null
    }
  })

  const oneSeqnoHigher = _increaseSeqnoByOne(after.sequenceNumber)
  const subMilestonesRef = db.collection(`Goals/${goalId}/Milestones`)
      .where('status', '==', enumMilestoneStatus.pending)
      .where('sequenceNumber', '>', after.sequenceNumber)
      .where('sequenceNumber', '<', oneSeqnoHigher)
  const subMilestonesSnap = await subMilestonesRef.get()
  for (const subMilestoneSnap of subMilestonesSnap.docs) {

    const subReceiver = <IReceiver>{}
    const subMilestone = subMilestoneSnap.data()

    subReceiver.id = subMilestone.achieverId || null
    subReceiver.username = subMilestone.achieverUsername || null
    subReceiver.photoURL = subMilestone.achieverPhotoURL || null

    supporters = await getUnfinishedSupports(goalId, subMilestoneSnap.id, supporters, subReceiver)
  }

  const timestamp = admin.firestore.FieldValue.serverTimestamp()

  Object.keys(supporters).forEach(supporter => {
    const date = new Date()
    const meta = createSupportDecisionMeta({
      deadline: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()).toISOString(),
    })

    const newNotification = createNotification({
      id: milestoneId,
      discussionId: milestoneId,
      event: enumEvent.gSupportStatusChangedToPending,
      source: {
        image: goal.image,
        name: goal.title,
        goalId: goalId,
        milestoneId: milestoneId,
        postId: milestoneId
      },
      type: 'supportDecision',
      message: [
        {
          text: startText
        },
        {
          text: endText
        }
      ],
      isRead: false,
      meta,
      createdAt: timestamp as Timestamp,
      updatedAt: timestamp as Timestamp
    })

    Object.keys(supporters[supporter]).forEach(support => {
      newNotification.meta.supports.push({
        id: support,
        description: supporters[supporter][support].description,
        decision: supporters[supporter][support].milestoneIsFinished ? 'give' : 'keep',
        milestoneIsFinished: supporters[supporter][support].milestoneIsFinished,
        receiverId: supporters[supporter][support].receiverId,
        receiverUsername: supporters[supporter][support].receiverUsername,
        receiverPhotoURL: supporters[supporter][support].receiverPhotoURL
      })
    })

    db.doc(`Users/${supporter}/Notifications/${milestoneId}`).set(newNotification)
  });

}

// Milestone successful
function sendNotificationMilestoneSuccessful(goalId: string, milestoneId: string, goal: Goal, milestone: Milestone) {

  const goalNotification = createNotification({
    discussionId: milestoneId,
    event: enumEvent.gMilestoneCompletedSuccessfully,
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

// Other functions
async function getUnfinishedSupports(goalId: string, milestoneId: string, supporters: any, receiver: IReceiver):Promise<any> {

  const supportsRef = db.collection(`Goals/${goalId}/Supports`).where('milestone.id', '==', milestoneId)
  const supportsSnap = await supportsRef.get()
  supportsSnap.forEach((supportSnap) => {
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
