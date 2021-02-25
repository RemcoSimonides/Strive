import { db, functions, admin } from '../../../internals/firebase';
import { Template } from '@strive/template/+state/template.firestore'
import { createCollectiveGoal, ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore'
import { sendNotificationToCollectiveGoalStakeholders } from '../../../shared/notification/notification';
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumEvent } from '@strive/notification/+state/notification.firestore';

export const templateCreatedHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}/Templates/{templateId}`)
  .onCreate((snapshot, context) => {

    const template: Template = Object.assign(<Template>{}, snapshot.data())
    const collectiveGoalId = context.params.collectiveGoalId
    const templateId = context.params.templateId

    sendNewTemplateNotification(collectiveGoalId, templateId, template)
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

async function sendNewTemplateNotification(collectiveGoalId: string, templateId: string, template: Template) {

  const collectiveGoalRef = db.doc(`CollectiveGoals/${collectiveGoalId}`)
  const collectiveGoalSnap = await collectiveGoalRef.get()
  const collectiveGoal = createCollectiveGoal(collectiveGoalSnap.data()) 

  const notification = createNotification({
    discussionId: templateId,
    event: enumEvent.cgTemplateAdded,
    source: {
      image: collectiveGoal.image,
      name: collectiveGoal.title,
      collectiveGoalId: collectiveGoalId,
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
  })
  sendNotificationToCollectiveGoalStakeholders(collectiveGoalId, notification, true, true)
}