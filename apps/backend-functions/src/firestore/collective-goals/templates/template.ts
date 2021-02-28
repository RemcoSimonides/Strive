import { db, functions, increment } from '../../../internals/firebase';
import { createTemplate, Template } from '@strive/template/+state/template.firestore'
import { createCollectiveGoal, ICollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore'
import { sendNotificationToCollectiveGoalStakeholders } from '../../../shared/notification/notification';
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumEvent } from '@strive/notification/+state/notification.firestore';
import { ErrorResultResponse, getDocument } from 'apps/backend-functions/src/shared/utils';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { createGoal, GoalPublicityType } from '@strive/goal/goal/+state/goal.firestore';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Profile } from '@strive/user/user/+state/user.firestore';
import { createMilestone } from '@strive/milestone/+state/milestone.firestore';
import { logger } from 'firebase-functions';

export const templateCreatedHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}/Templates/{templateId}`)
  .onCreate((snapshot, context) => {

    const template = createTemplate(snapshot.data())
    const { collectiveGoalId, templateId } = context.params

    sendNewTemplateNotification(collectiveGoalId, templateId, template)
  })

export const useTemplate = functions.https.onCall(async (
  data: { collectiveGoalId: string, templateId: string},
  context: CallableContext
): Promise<ErrorResultResponse> => {
  
  if (!context.auth) {
    logger.error(`UNAUTHORIZED - User needs to be authorized`)
    return {
      error: `UNAUTHORIZED`,
      result: `User needs to be authorized`
    }
  }

  const uid = context.auth.uid;

  const [ template, collectiveGoal, profile ] = await Promise.all([
    getDocument<Template>(`CollectiveGoals/${data.collectiveGoalId}/Templates/${data.templateId}`),
    getDocument<ICollectiveGoal>(`CollectiveGoals/${data.collectiveGoalId}`),
    getDocument<Profile>(`Users/${uid}/Profile/${uid}`)
  ])

  let publicity: GoalPublicityType
  if (collectiveGoal.isPublic && template.goalIsPublic) {
    publicity = 'public'
  } else if (!collectiveGoal.isPublic && template.goalIsPublic) {
    publicity = 'collectiveGoalOnly'
  } else {
    publicity = 'private'
  }

  // Create goal
  const goal = createGoal({
    title: template.goalTitle,
    description: template.goalDescription ?? '',
    publicity: publicity,
    deadline: template.goalDeadline,
    shortDescription: template.goalShortDescription,
    image: template.goalImage,
    milestoneTemplateObject: template.milestoneTemplateObject,
    collectiveGoalId: data.collectiveGoalId
  })
  const { id } = await db.collection(`Goals`).add(goal)

  const promises: any[] = []

  // Create stakeholder
  const stakeholder = createGoalStakeholder({
    id: uid,
    goalId: id,
    goalImage: template.goalImage,
    goalPublicity: publicity,
    goalTitle: template.goalTitle,
    isAdmin: true,
    isAchiever: true,
    uid,
    username: profile.username,
    photoURL: profile.photoURL
  })
  const p = db.doc(`Goals/${id}/GStakeholders/${uid}`).set(stakeholder)
  promises.push(p)

  // Create milestones
  template.milestoneTemplateObject.forEach(m => {
    const milestone = createMilestone(m)
    const promise = db.doc(`Goals/${id}/Milestones/${m.id}`).set(milestone)
    promises.push(promise)
  })

  // increase template times used
  db.doc(`CollectiveGoals/${data.collectiveGoalId}/Templates/${data.templateId}`).update({
    numberOfTimesUsed: increment(1)
  })

  await Promise.all(promises)
  return {
    error: '',
    result: id
  }
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