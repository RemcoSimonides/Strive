import * as admin from 'firebase-admin'
import { createMilestone } from '@strive/milestone/+state/milestone.firestore'
import { createGoal } from '@strive/goal/goal/+state/goal.firestore'
import { sendNotificationToGoal, sendNotificationToGoalStakeholders } from '../../shared/notification/notification';
import { createNotification } from '@strive/notification/+state/notification.model';

const db = admin.firestore()

export async function sendNotificationMilestoneDeadlinePassed(goalId: string, milestoneId: string): Promise<void> {

  const goalDocRef = db.doc(`Goals/${goalId}`)
  const goalDocSnap = await goalDocRef.get()
  const goal = createGoal(goalDocSnap.data())

  const milestoneDocRef = db.doc(`Goals/${goalId}/Milestones/${milestoneId}`)
  const milestoneDocSnap = await milestoneDocRef.get()
  const milestone = createMilestone(milestoneDocSnap.data()) 

  const goalNotification = createNotification({
    discussionId: milestoneId,
    message: [
      {
        text: `Milestone '${milestone.description}' of goal '`
      },
      {
        text: goal.title,
        link: `goal/${goalId}`
      },
      {
        text: `' has passed the due date`
      }
    ]
  })
  sendNotificationToGoal(goalId, goalNotification)

  const goalStakeholdersNotification = createNotification({
    discussionId: milestoneId,
    message: [
      {
        text: `Milestone '${milestone.description}' has passed the due date`
      }
    ]
  })
  sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification)
}
