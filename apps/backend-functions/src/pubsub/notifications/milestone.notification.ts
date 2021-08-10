import { createMilestone, createMilestoneLink, Milestone } from '@strive/milestone/+state/milestone.firestore'
import { createGoal, createGoalLink, Goal } from '@strive/goal/goal/+state/goal.firestore'
import { sendNotificationToGoal, sendNotificationToGoalStakeholders } from '../../shared/notification/notification';
import { createNotification } from '@strive/notification/+state/notification.model';
import { getDocument } from '../../shared/utils';
import { enumEvent } from '@strive/notification/+state/notification.firestore';

export async function sendNotificationMilestoneDeadlinePassed(goalId: string, milestoneId: string): Promise<void> {
 
  const [goal, milestone] = await Promise.all([
    getDocument<Goal>(`Goals/${goalId}`).then(data => createGoal(data)),
    getDocument<Milestone>(`Goals/${goalId}/Milestones/${milestoneId}`).then(data => createMilestone(data))
  ])

  const notification = createNotification({
    discussionId: milestoneId,
    event: enumEvent.gMilestoneDeadlinePassed,
    source: {
      goal: createGoalLink({ id: goalId, ...goal }),
      milestone: createMilestoneLink({ id: milestoneId, ...milestone })
    }
  })
  sendNotificationToGoal(goalId, notification)

  notification.type = 'notification'
  sendNotificationToGoalStakeholders(goalId, notification, '', undefined, true, undefined)
}
