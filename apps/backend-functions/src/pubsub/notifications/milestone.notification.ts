import * as admin from 'firebase-admin'
import { INotificationBase, enumNotificationType } from '@strive/interfaces';
import { createMilestone } from '@strive/milestone/+state/milestone.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
import { sendNotificationToGoal, sendNotificationToGoalStakeholders } from '../../shared/notification/notification';

const db = admin.firestore()

export async function sendNotificationMilestoneDeadlinePassed(goalId: string, milestoneId: string): Promise<void> {

    const goalDocRef: FirebaseFirestore.DocumentReference = db.doc(`Goals/${goalId}`)
    const goalDocSnap: FirebaseFirestore.DocumentSnapshot = await goalDocRef.get()
    const goal: Goal = Object.assign(<Goal>{}, goalDocSnap.data())

    const milestoneDocRef: FirebaseFirestore.DocumentReference = db.doc(`Goals/${goalId}/Milestones/${milestoneId}`)
    const milestoneDocSnap: FirebaseFirestore.DocumentSnapshot = await milestoneDocRef.get()
    const milestone = createMilestone(milestoneDocSnap.data()) 

    const goalNotification: Partial<INotificationBase> = {
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
        ],
        notificationType: enumNotificationType.general
    }
    await sendNotificationToGoal(goalId, goalNotification)

    const goalStakeholdersNotification: Partial<INotificationBase> = {
        discussionId: milestoneId,
        message: [
            {
                text: `Milestone '${milestone.description}' has passed the due date`
            }
        ],
        notificationType: enumNotificationType.general
    }
    await sendNotificationToGoalStakeholders(goalId, goalStakeholdersNotification)

}
