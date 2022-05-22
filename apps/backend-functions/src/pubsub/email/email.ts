import { db, functions } from '../../internals/firebase';
import { Timestamp } from '@firebase/firestore-types';

import { subWeeks, isAfter, subMonths, isWithinInterval } from 'date-fns';

import { createPersonal, Personal } from '@strive/user/user/+state/user.firestore';
import { getDocument } from '../../shared/utils';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { Motivation, Motivations } from '../../../../admin/src/app/pages/motivation/motivation.model';
import { Feature, Features } from '../../../../admin/src/app/pages/features/features.model';
import { groupIds, templateIds } from './ids';
import { createNotification } from '@strive/notification/+state/notification.model';
import { sendMailFromTemplate } from '../../shared/sendgrid/sendgrid';


// // crontab.guru to determine schedule value
// export const scheduledEmailRunner = functions.pubsub.schedule('*/5 * * * *').onRun(async () => {
export const scheduledEmailRunner = functions.pubsub.schedule('0 0 1 * *').onRun(async () => {

  const [ profileSnaps, motivation, newFeatures ] = await Promise.all([
    db.collectionGroup('Personal').get(),
    getMotivation(),
    getNewFeatures()
  ])

  for (const doc of profileSnaps.docs) {
    const personal = createPersonal(doc.data())
    if (newerThanWeek(personal)) continue

    const [goals, notifications] = await Promise.all([
      getGoals(personal.uid),
      getNotifications(personal.uid)
    ])
    const futureGoals = goals.filter(goal => goal.status === 'bucketlist')
    const currentGoals = goals.filter(goal => goal.status === 'active')
    if (!futureGoals.length && !currentGoals.length) continue

    const unreadNotifications = notifications.filter(notification => notification.type === 'notification').length
    const newUpdates = notifications.filter(notification => notification.type === 'feed').length

    const data = { 
      futureGoals,
      currentGoals,
      motivation,
      unreadNotifications,
      newUpdates,
      newFeatures
    }

    await sendMailFromTemplate({
      to: personal.email,
      templateId: templateIds.monthlyGoalReminder,
      data,
    }, groupIds.unsubscribeAll)
  }
})

async function getGoals(uid: string): Promise<Goal[]> {
  const stakeholderSnaps = await db.collectionGroup(`GStakeholders`).where(`uid`, `==`, uid).where('isAchiever', '==', true).orderBy('createdAt', 'desc').get()

  const promises = stakeholderSnaps.docs.map(doc => {
    const stakeholder = createGoalStakeholder(doc.data())
    return getDocument<Goal>(`Goals/${stakeholder.goalId}`)
  })
  return Promise.all(promises)
}

async function getMotivation(): Promise<Motivation> {
  const ref = db.doc('miscellaneous/motivation')
  const motivationsSnap = await ref.get()
  const motivations = motivationsSnap.data() as Motivations
  const index = motivations.quotes.findIndex(quote => !quote.used)

  motivations.quotes[index].used = true
  ref.update({ quotes: motivations.quotes })

  return motivations.quotes[index]
}

async function getNewFeatures(): Promise<Feature[]> {
  const featuresSnap = await db.doc('miscellaneous/feature').get()

  const end = new Date()
  const start = subMonths(end, 1)
  return (featuresSnap.data() as Features).features.filter(feature => {
    const createdAt = (feature.createdAt as Timestamp).toDate()
    return isWithinInterval(createdAt, { start, end })
  })
}

async function getNotifications(uid: string) {
  const monthAgo = subMonths(new Date(), 1)
  const notificationsSnap = await db.collection(`Users/${uid}/Notifications`).where('isRead', '==', false).where('createdAt', '>', monthAgo) .get()
  return notificationsSnap.docs.map(doc => createNotification(doc.data()))
}

function newerThanWeek(personal: Personal): boolean {
  const weekAgo = subWeeks(new Date(), 1)
  const createdAt = (personal.createdAt as Timestamp).toDate()
  return isAfter(createdAt, weekAgo)
}