import { createMilestone, Milestone } from '@strive/milestone/+state/milestone.firestore'
import { createGoal, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { sendNotificationToGoal, sendNotificationToGoalStakeholders } from '../../shared/notification/notification';
import { createNotification } from '@strive/notification/+state/notification.model';
import { getDocument } from '../../shared/utils';

export async function sendNotificationMilestoneDeadlinePassed(goalId: string, milestoneId: string): Promise<void> {
 
  const [goal, milestone] = await Promise.all([
    getDocument<Goal>(`Goals/${goalId}`).then(data => createGoal(data)),
    getDocument<Milestone>(`Goals/${goalId}/Milestones/${milestoneId}`).then(data => createMilestone(data))
  ])

  const goalNotification = createNotification({
    discussionId: milestoneId,
    type: 'feed',
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
    type: 'notification',
    message: [
      {
        text: `Milestone '${milestone.description}' has passed the due date`
      }
    ]
  })
  sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification)
}
