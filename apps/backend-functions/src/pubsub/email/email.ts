import { db, functions, logger } from '../../internals/firebase'

import { subWeeks, isAfter, subMonths, isWithinInterval } from 'date-fns'

import { createPersonal, inBucketlist, inProgress, isFinished, Personal, storyEvents } from '@strive/model'
import { getDocument } from '../../shared/utils'
import { createGoalEvent, Goal, createGoalStakeholder, GoalStakeholder, createNotification, Feature, Features, Motivation, Motivations } from '@strive/model'
import { groupIds, templateIds } from './ids'
import { sendMailFromTemplate } from '../../shared/sendgrid/sendgrid'
import { toDate } from '../../shared/utils'


// // crontab.guru to determine schedule value
// export const scheduledEmailRunner = functions.pubsub.schedule('*/5 * * * *').onRun(async () => {
export const scheduledEmailRunner = functions.pubsub.schedule('0 0 1 * *').onRun(async () => {

  const [ personalSnaps, motivation, newFeatures ] = await Promise.all([
    db.collectionGroup('Personal').get(),
    getMotivation(),
    getNewFeatures()
  ])

  for (const doc of personalSnaps.docs) {
    const personal = createPersonal(toDate(doc.data()))
    if (newerThanWeek(personal)) continue

    const stakeholders = await getStakeholders(personal.uid)

    const [goals, events, notifications] = await Promise.all([
      getGoals(stakeholders),
      getGoalEvents(stakeholders),
      getNotifications(personal)
    ])

    const inProgressGoals = goals.filter(goal => inProgress(goal))
    const bucketlistGoals = goals.filter(goal => inBucketlist(goal))  
    if (!inProgressGoals.length && !bucketlistGoals.length) continue

    const unreadNotifications = notifications.length
    const newUpdates = events

    const data = {
      inProgressGoals,
      bucketlistGoals,
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

async function getStakeholders(uid: string) {
  const stakeholderSnaps = await db.collectionGroup(`GStakeholders`).where(`uid`, `==`, uid).where('isAchiever', '==', true).orderBy('createdAt', 'desc').get()
  return stakeholderSnaps.docs.map(doc => createGoalStakeholder(toDate(doc.data())))
}

async function getGoals(stakeholders: GoalStakeholder[]): Promise<Goal[]> {
  const promises = stakeholders.map(stakeholder => getDocument<Goal>(`Goals/${stakeholder.goalId}`))
  return Promise.all(promises)
}

async function getGoalEvents(stakeholders: GoalStakeholder[]): Promise<number> {
  const promises = stakeholders.map(stakeholder => db.collection(`GoalEvents`).where('source.goal.id', '==', stakeholder.goalId).where('createdAt', '>', stakeholder.lastCheckedGoal).get())
  const eventsSnaps = await Promise.all(promises)  
  const events = eventsSnaps.map(snap => snap.docs.map(doc => createGoalEvent(toDate({ ...doc.data(), id: doc.id }))))
  const flatten = events.reduce((acc, val) => acc.concat(val), [])
  const messages = flatten.map(event => storyEvents.includes(event.name)).length

  return messages
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
  return (toDate(featuresSnap.data()) as Features).features.filter(feature => {
    return isWithinInterval(feature.createdAt, { start, end })
  })
}

async function getNotifications(personal: Personal) {
  let snap: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>
  if (personal.lastCheckedNotifications) {
    snap = await db.collection(`Users/${personal.uid}/Notifications`).where('createdAt', '>', personal.lastCheckedNotifications).get()
  } else {
    snap = await db.collection(`Users/${personal.uid}/Notifications`).get()
  }

  return snap.docs.map(doc => createNotification(toDate({ ...doc.data(), id: doc.id })))
}

function newerThanWeek(personal: Personal): boolean {
  const weekAgo = subWeeks(new Date(), 1)
  return isAfter(personal.createdAt, weekAgo)
}