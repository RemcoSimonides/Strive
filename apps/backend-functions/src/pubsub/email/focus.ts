import { db, functions, logger } from '../../internals/firebase'

import { GoalLink, Personal } from '@strive/model'
import { getDocument, unique } from '../../shared/utils'
import { Goal, createGoalStakeholder, GoalStakeholder } from '@strive/model'
import { groupIds, templateIds } from './ids'
import { sendMailFromTemplate } from '../../shared/sendgrid/sendgrid'
import { toDate } from '../../shared/utils'
import { getImgIxResourceUrl } from '../../shared/image/image'


function getFocusData(goal: Goal, stakeholder: GoalStakeholder): { goal: GoalLink, stakeholder: GoalStakeholder } {
  return {
    goal: {
      id: goal.id,
      title: goal.title,
      image: goal.image ? getImgIxResourceUrl(goal.image, { h: 200, w: 200 }) : ''
    },
    stakeholder
  }
}

// // crontab.guru to determine schedule value
// export const scheduledFocusEmailRunner = functions.pubsub.schedule('*/5 * * * *').onRun(async () => {
export const scheduledFocusEmailRunner = functions.pubsub.schedule('first friday of month 08:00').onRun(async () => {

  const stakeholdersSnap = await db.collectionGroup('GStakeholders').where('focus.on', '==', true).get()
  const stakeholders = stakeholdersSnap.docs.map(doc => createGoalStakeholder(toDate({ ...doc.data(), uid: doc.id })))
  logger.log('stakeholders: ', stakeholders)

  const goalIds = unique(stakeholders.map(stakeholder => stakeholder.goalId))
  const promises = goalIds.map(id => getDocument<Goal>(`Goals/${id}`))
  const goals =  await Promise.all(promises)
  
  logger.log('goals: ', goals)

  const personalPromises = stakeholders.map(({ uid }) => getDocument<Personal>(`Users/${uid}/Personal/${uid}`))
  const personals = await Promise.all(personalPromises)

  for (const stakeholder of stakeholders) {
    const goal = goals.find(goal => goal.id === stakeholder.goalId)
    const personal = personals.find(personal => personal.uid === stakeholder.uid)

    const data = getFocusData(goal, stakeholder)
    logger.log('data: ', data)

    await sendMailFromTemplate({
      to: personal.email,
      templateId: templateIds.monthlyGoalFocus,
      data
    }, groupIds.unsubscribeAll)
  }
})