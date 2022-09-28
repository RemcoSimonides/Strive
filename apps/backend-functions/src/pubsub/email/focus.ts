import { db, functions, gcsBucket } from '../../internals/firebase'

import { Personal } from '@strive/model'
import { getDocument, unique } from '../../shared/utils'
import { Goal, createGoalStakeholder, GoalStakeholder } from '@strive/model'
import { groupIds, templateIds } from './ids'
import { sendMailFromTemplate } from '../../shared/sendgrid/sendgrid'
import { toDate } from '../../shared/utils'
import { getImgIxResourceUrl } from '../../shared/image/image'
import { isAfter, subDays } from 'date-fns'
import { wrapPubsubOnRunHandler } from '../../internals/sentry'


function getFocusData(goal: Goal, stakeholder: GoalStakeholder): { goal: Partial<Goal>, stakeholder: GoalStakeholder } {
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
export const scheduledFocusEmailRunner = functions().pubsub.schedule('0 18 * * 5').onRun(wrapPubsubOnRunHandler('scheduledFocusEmailRunner',
async () => {

  const stakeholdersSnap = await db.collectionGroup('GStakeholders').where('focus.on', '==', true).get()
  const stakeholders = stakeholdersSnap.docs.map(doc => createGoalStakeholder(toDate({ ...doc.data(), uid: doc.id })))

  const [ file ] = await gcsBucket.file('miscellaneous/Weekly Exercise.pdf').get()
  const [ pdf ] = await file.download()
  const base64 = pdf.toString('base64')


  const goalIds = unique(stakeholders.map(stakeholder => stakeholder.goalId))
  const promises = goalIds.map(id => getDocument<Goal>(`Goals/${id}`))
  const goals =  await Promise.all(promises)

  const personalPromises = stakeholders.map(({ uid }) => getDocument<Personal>(`Users/${uid}/Personal/${uid}`))
  const personals = await Promise.all(personalPromises)

  for (const stakeholder of stakeholders) {
    const goal = goals.find(goal => goal.id === stakeholder.goalId)
    const personal = personals.find(personal => personal.uid === stakeholder.uid)

    if (newerThanFourDays(goal)) continue

    const data = getFocusData(goal, stakeholder)

    await sendMailFromTemplate({
      to: personal.email,
      templateId: templateIds.monthlyGoalFocus,
      data,
      attachments: [
        {
          content: base64,
          filename: 'weekly exercise.pdf',
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    }, groupIds.unsubscribeAll)
  }
}))

function newerThanFourDays(goal: Goal): boolean {
  const fourDaysAgo = subDays(new Date(), 4)
  return isAfter(goal.createdAt, fourDaysAgo)
}