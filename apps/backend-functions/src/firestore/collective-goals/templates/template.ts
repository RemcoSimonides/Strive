import { db, functions, increment, serverTimestamp } from '../../../internals/firebase';
import { createTemplate, createTemplateLink, Template } from '@strive/template/+state/template.firestore'
import { createCollectiveGoal, CollectiveGoal, createCollectiveGoalLink } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore'
import { sendNotificationToCollectiveGoalStakeholders } from '../../../shared/notification/notification';
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumEvent } from '@strive/notification/+state/notification.firestore';
import { ErrorResultResponse, getDocument } from '../../../shared/utils';
import { CallableContext } from 'firebase-functions/lib/providers/https';
import { createGoal, GoalPublicityType } from '@strive/goal/goal/+state/goal.firestore';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { User } from '@strive/user/user/+state/user.firestore';
import { createMilestone } from '@strive/milestone/+state/milestone.firestore';
import { logger } from 'firebase-functions';
import { Timestamp } from '@firebase/firestore-types';

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
  const timestamp = serverTimestamp()

  const [ template, collectiveGoal, user ] = await Promise.all([
    getDocument<Template>(`CollectiveGoals/${data.collectiveGoalId}/Templates/${data.templateId}`),
    getDocument<CollectiveGoal>(`CollectiveGoals/${data.collectiveGoalId}`),
    getDocument<User>(`Users/${uid}`)
  ])

  let publicity: GoalPublicityType
  if (collectiveGoal.isSecret && template.goalIsSecret) {
    publicity = 'private'
  } else if (collectiveGoal.isSecret && !template.goalIsSecret) {
    publicity = 'collectiveGoalOnly'
  } else {
    publicity = 'public'
  }

  // Create goal
  const goal = createGoal({
    title: template.goalTitle,
    description: template.goalDescription ?? '',
    publicity,
    deadline: template.goalDeadline,
    image: template.goalImage,
    roadmapTemplate: template.roadmapTemplate,
    collectiveGoalId: data.collectiveGoalId,
    createdAt: timestamp as Timestamp,
    updatedAt: timestamp as Timestamp,
    updatedBy: uid
  })
  const { id } = await db.collection(`Goals`).add(goal)

  const promises: any[] = []

  // Create stakeholder
  const stakeholder = createGoalStakeholder({
    goalId: id,
    goalPublicity: publicity,
    isAdmin: true,
    isAchiever: true,
    uid,
    username: user.username,
    photoURL: user.photoURL,
    createdAt: timestamp,
    updatedAt: timestamp,
    updatedBy: uid
  })
  const p = db.doc(`Goals/${id}/GStakeholders/${uid}`).set(stakeholder)
  promises.push(p)

  // Create milestones
  template.roadmapTemplate.forEach(m => {
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

async function sendNewTemplateNotification(collectiveGoalId: string, templateId: string, template: Template) {

  const snap = await db.doc(`CollectiveGoals/${collectiveGoalId}`).get()
  const collectiveGoal = createCollectiveGoal(snap.data()) 

  const notification = createNotification({
    discussionId: templateId,
    event: enumEvent.cgTemplateAdded,
    type: 'notification',
    target: 'stakeholder',
    source: {
      collectiveGoal: createCollectiveGoalLink(collectiveGoal),
      template: createTemplateLink({
        ...template,
        id: templateId
      })
    }
  })
  sendNotificationToCollectiveGoalStakeholders(collectiveGoalId, notification, template.updatedBy, true, true)
}