import { db, functions, admin } from '../../../internals/firebase';
import { ITemplate, INotificationBase, enumEvent } from '@strive/interfaces';
import { ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore'
import { sendNotificationToCollectiveGoalStakeholders } from '../../../shared/notification/notification';

export const templateCreatedHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}/Templates/{templateId}`)
    .onCreate(async (snapshot, context) => {

        const template: ITemplate = Object.assign(<ITemplate>{}, snapshot.data())
        const collectiveGoalId = context.params.collectiveGoalId
        const templateId = context.params.templateId

        await sendNewTemplateNotification(collectiveGoalId, templateId, template)

    })

// export const templateDeletedHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}/Templates/{templateId}`)
//     .onDelete(async (snapshot, context) => {

//         const templateId = snapshot.id

//     })

// export const templateChangeHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}/Templates/{templateId}`)
//     .onUpdate(async (snapshot, context) => {

//         const before: ITemplate = Object.assign(<ITemplate>{}, snapshot.before.data())
//         const after: ITemplate = Object.assign(<ITemplate>{}, snapshot.after.data())
//         if (!before) return
//         if (!after) return

//         const collectiveGoalId = context.params.collectiveGoalId
//         const templateId = context.params.templateId


//     })

async function sendNewTemplateNotification(collectiveGoalId: string, templateId: string, template: ITemplate): Promise<void> {

    const collectiveGoalRef: admin.firestore.DocumentReference = db.doc(`CollectiveGoals/${collectiveGoalId}`)
    const collectiveGoalSnap: admin.firestore.DocumentSnapshot = await collectiveGoalRef.get()
    const collectiveGoal: ICollectiveGoal = Object.assign(<ICollectiveGoal>{}, collectiveGoalSnap.data()) 

    const notification: Partial<INotificationBase> = {
        discussionId: templateId,
        event: enumEvent.cgTemplateAdded,
        source: {
            image: collectiveGoal.image,
            name: collectiveGoal.title,
            collecetiveGoalId: collectiveGoalId,
            templateId: templateId
        },
        message: [
            {
                text: `New template '`
            },
            {
                text: template.title,
                link: `collective-goal/${collectiveGoalId}/template/${templateId}`
            },
            {
                text: `' has been created! Check it out`
            }
        ]
    }

    await sendNotificationToCollectiveGoalStakeholders(collectiveGoalId, notification, true, true)
}