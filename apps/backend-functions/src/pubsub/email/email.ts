import { db, functions } from '../../internals/firebase';

import * as moment from 'moment'
import * as sgMail from '@sendgrid/mail'

import { CollectiveGoalStakeholder, createCollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { Profile, User as IUser } from '@strive/user/user/+state/user.firestore';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { sendgridAPIKey, sendgridTemplate } from '../../environments/environment';
import { createNotification } from '@strive/notification/+state/notification.model';
import { converter, getCollection, getDocument } from '../../shared/utils';

const API_KEY = sendgridAPIKey;
const TEMPLATE_ID = sendgridTemplate;
sgMail.setApiKey(API_KEY)

// crontab.guru to determine schedule value
// export const scheduledEmailRunner = functions.pubsub.schedule('*/5 * * * *').onRun(async (context) => {
export const scheduledEmailRunner = functions.pubsub.schedule('5 8 * * 6').onRun(async (context) => {
    
  const dateWeekAgo = moment(context.timestamp).subtract(7, 'days').toDate()

  // get users
  const users = await getCollection<IUser>(`Users`)

  for (const user of users) {
    let mail =  `
    <h1>Strive Journal update</h1>
    <h3>Missed notifications</h3>`

    const data = await getData(user.id, dateWeekAgo)
    if (!hasNewNotifications(data)) return
    mail += getGoalUpdatesHTML(data)
    mail += getCollectiveGoalUpdatesHTML(data)
    mail += getUserUpdates(data.user)

    console.log('email', user.email)
    console.log('mail', mail)
    await submitEmail(mail, user.email)
  }
})

function hasNewNotifications(data: Data): boolean {
  let hasUpdates = false
  hasUpdates = data.collectiveGoals.some(collectiveGoal => !!collectiveGoal.notifications.length)
  if (!hasUpdates) hasUpdates = data.goals.some(goal => !!goal.notifications.length)
  if (!hasUpdates) hasUpdates = !!data.user.notifications.length
  return hasUpdates
}

async function getData(uid: string, fromDate: Date): Promise<Data> {

  const data: Data = {
    goals: [],
    collectiveGoals: [],
    user: { id: '', username: '', notifications: [] }
  }

  data.goals = await getGoals(uid, fromDate)
  data.collectiveGoals = await getCollectiveGoals(uid, fromDate)
  data.user = await getUserData(uid, fromDate)

  return data
}

async function getGoals(uid: string, fromDate: Date): Promise<Goal[]> {
  const goals: Goal[] = []

  // get goals
  const gStakeholdersSnap = await db.collectionGroup(`GStakeholders`).where(`uid`, `==`, uid).where('goalIsFinished', '==', false).get()

  for (const doc of gStakeholdersSnap.docs) {
    const GStakeholder = createGoalStakeholder(doc.data())
    const notifications = await getGoalNotifications(GStakeholder.goalId, fromDate)

    goals.push({
      id: GStakeholder.goalId,
      title: GStakeholder.goalTitle,
      notifications
    })
  }

  return goals
}

async function getGoalNotifications(goalId: string, fromDate: Date): Promise<Notification[]> {
  const notificationsSnap = await db
    .collection(`Goals/${goalId}/Notifications`)
    .where('createdAt', '>=', fromDate)
    .orderBy('createdAt')
    .withConverter<Notification>(converter(createNotification))
    .get()

  return notificationsSnap.docs.map(doc => doc.data())
}

async function getCollectiveGoals(uid: string, fromDate: Date): Promise<Goal[]> {

  const collectiveGoals: Goal[] = []

  const cGStakeholdersSnap = await db
    .collectionGroup(`CGStakeholders`)
    .where(`uid`, `==`, uid)
    .withConverter<CollectiveGoalStakeholder>(converter(createCollectiveGoalStakeholder))
    .get()

  for (const doc of cGStakeholdersSnap.docs) {
    const CGStakeholder = doc.data()
    const notifications = await getCollectiveGoalNotifications(CGStakeholder.collectiveGoalId, fromDate)

    collectiveGoals.push({
      id: CGStakeholder.collectiveGoalId,
      title: CGStakeholder.collectiveGoalTitle,
      notifications
    })
  }
  return collectiveGoals
}

async function getCollectiveGoalNotifications(collectiveGoalId: string, fromDate: Date): Promise<Notification[]> {
  const notificationsSnap = await db
    .collection(`ColleciveGoals/${collectiveGoalId}/Notifications`)
    .where('createdAt', '>=', fromDate)
    .orderBy('createdAt')
    .withConverter<Notification>(converter(createNotification))
    .get()

  return notificationsSnap.docs.map(doc => doc.data())
}

async function getUserData(uid: string, fromDate: Date): Promise<User> {
  const profile = await getDocument<Profile>(`Users/${uid}/Profile/${uid}`)
  const notificationsSnap = await db
    .collection(`Users/${uid}/Notifications`)
    .where('event', '>=', 400000)
    .where('event', '<', 500000)
    .where('createdAt', '>=', fromDate)
    .withConverter<Notification>(converter(createNotification))
    .get()
  const notifications = notificationsSnap.docs.map(doc => doc.data())

  return {
    id: uid,
    username: profile.username,
    notifications
  }
}

function getGoalUpdatesHTML(data: Data): string {
  let html = '' 

  data.goals.forEach(goal => {
    html += getGoalUpdateHTML(goal)
  })
    
  return html
}

function getGoalUpdateHTML(goal: Goal): string {
  let html = `<h2>${goal.title}</h2>`

  if (!!goal.notifications.length) {
    html += getNotificationListHTML(goal.notifications)
  } else {
    html += 'no updates'
  }

  return html
}

function getNotificationListHTML(notifications: Notification[]): string {
  let html = '<ul>'

  notifications.forEach(notification => {
    const date = moment.unix(notification.createdAt?.seconds ?? 0).format('MMM Do, h:mm a')
    const messageText: string = notification.message.map(messageObj => messageObj.text).join(' ')

    html += `<li>${date}: ${messageText}</li>`
  })

  html += '</ul>'

  return html
}

function getCollectiveGoalUpdatesHTML(data: Data): string {
  let html = '' 

  data.collectiveGoals.forEach(collectiveGoal => {
    html += getCollectiveGoalUpdateHTML(collectiveGoal)
  })

  return html
}

function getCollectiveGoalUpdateHTML(collectiveGoal: CollectiveGoal): string {
  let html = `<h2>${collectiveGoal.title}</h2>`

  if (!!collectiveGoal.notifications.length) {
    html += getNotificationListHTML(collectiveGoal.notifications)
  } else {
    html += 'no updates'
  }

  return html
}

function getUserUpdates(user: User): string {
  let html = '<h2>Your personal notifications</h2>'

  if (!!user.notifications.length) {
    html += getNotificationListHTML(user.notifications)
  } else {
    html += 'no updates'
  }

  return html
}

async function submitEmail(mail: string, receiverEmailAddress: string) {

  console.log('trying to submit email', receiverEmailAddress)

  const msg = {
    to: 'remcosimonides@gmail.com',
    from: 'remco@lets.support',
    templateId: TEMPLATE_ID,
    dynamic_template_data: {
      subject: 'Weekly Update',
      body: mail
    }
  }

  return sgMail.send(msg)
}

interface Data {
  collectiveGoals: CollectiveGoal[];
  goals: Goal[];
  user: User;
}

interface Goal {
  id: string;
  title: string;
  notifications: Notification[];
}

interface CollectiveGoal {
  id: string;
  title: string;
  notifications: Notification[];
}

interface User {
  id: string;
  username: string;
  notifications: Notification[];
}