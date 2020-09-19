import * as admin from 'firebase-admin'
import { INotificationBase, enumNotificationType, IMilestone, IGoal } from '@strive/interfaces';
import { sendNotificationToGoal, sendNotificationToGoalStakeholders } from '../../shared/notification/notification';

const db = admin.firestore()

export async function sendNotificationMilestoneDeadlinePassed(goalId: string, milestoneId: string): Promise<void> {

    const goalDocRef: FirebaseFirestore.DocumentReference = db.doc(`Goals/${goalId}`)
    const goalDocSnap: FirebaseFirestore.DocumentSnapshot = await goalDocRef.get()
    const goal: IGoal = Object.assign(<IGoal>{}, goalDocSnap.data())

    const milestoneDocRef: FirebaseFirestore.DocumentReference = db.doc(`Goals/${goalId}/Milestones/${milestoneId}`)
    const milestoneDocSnap: FirebaseFirestore.DocumentSnapshot = await milestoneDocRef.get()
    const milestone: IMilestone = Object.assign(<IMilestone>{}, milestoneDocSnap.data()) 

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
