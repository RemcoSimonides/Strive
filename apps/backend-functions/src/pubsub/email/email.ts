import { db, functions } from '../../internals/firebase';

import * as moment from 'moment'
import * as sgMail from '@sendgrid/mail'

import { createCollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';
import { Notification, NotificationMeta } from '@strive/notification/+state/notification.firestore';
import { Profile, User as IUser } from '@strive/user/user/+state/user.firestore';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore'
import { createNotification } from '@strive/notification/+state/notification.model';
import { getCollection, getDocument } from '../../shared/utils';
import { MailDataRequired } from '@sendgrid/mail';

const TEMPLATE_ID = 'd-b7a805f974814ca084c8d0a47d110322';

// crontab.guru to determine schedule value
// export const scheduledEmailRunner = functions.pubsub.schedule('*/5 * * * *').onRun(async (context) => {
export const scheduledEmailRunner = functions.pubsub.schedule('5 8 * * 6').onRun(async (context) => {

  const dateWeekAgo = moment(context.timestamp).subtract(7, 'days').toDate()

  // get users
  const users = await getCollection<IUser>(`Users`)

  for (const user of users) {
    let mail =  `
    <h1>Strive Journal update</h1>
    <h2>Missed notifications</h2>`

    const data = await getData(user.id, dateWeekAgo)
    if (!hasNewNotifications(data)) continue
    mail += getGoalUpdatesHTML(data)
    mail += getCollectiveGoalUpdatesHTML(data)
    mail += getUserUpdates(data.user)

    await sendTemplateEmail('', TEMPLATE_ID, { text: mail })
  }
})

function hasNewNotifications({ collectiveGoals, goals, user }: Data): boolean {
  return collectiveGoals.some(collectiveGoal => !!collectiveGoal.notifications.length)
    || goals.some(goal => !!goal.notifications.length)
    || !!user.notifications.length
}

async function getData(uid: string, fromDate: Date): Promise<Data> {
  const [ goals, collectiveGoals, user ] = await Promise.all([
    getGoals(uid, fromDate),
    getCollectiveGoals(uid, fromDate),
    getUserData(uid, fromDate)
  ])
  return { goals, collectiveGoals, user }
}

async function getGoals(uid: string, fromDate: Date): Promise<Goal[]> {
  const gStakeholdersSnap = await db.collectionGroup(`GStakeholders`).where(`uid`, `==`, uid).get()

  const promises = gStakeholdersSnap.docs.map(doc => {
    const gStakeholder = createGoalStakeholder(doc.data())
    return getGoalNotifications(gStakeholder.goalId, fromDate).then(notifications => {
      const goal: Goal = {
        id: gStakeholder.goalId,
        title: gStakeholder.goalTitle,
        notifications
      }
      return goal
    })
  })
  return Promise.all(promises);
}

async function getGoalNotifications(goalId: string, fromDate: Date): Promise<Notification<NotificationMeta>[]> {
  const notificationsSnap = await db
    .collection(`Goals/${goalId}/Notifications`)
    .where('createdAt', '>=', fromDate)
    .orderBy('createdAt')
    .get()

  return notificationsSnap.docs.map(doc => createNotification(doc.data()))
}

async function getCollectiveGoals(uid: string, fromDate: Date): Promise<Goal[]> {
  const cGStakeholdersSnap = await db
    .collectionGroup(`CGStakeholders`)
    .where(`uid`, `==`, uid)
    .get()


  const promises = cGStakeholdersSnap.docs.map(doc => {
    const cGStakeholder = createCollectiveGoalStakeholder(doc.data())
    return getCollectiveGoalNotifications(cGStakeholder.collectiveGoalId, fromDate).then(notifications => {
      const collectiveGoal: CollectiveGoal = {
        id: cGStakeholder.collectiveGoalId,
        title: cGStakeholder.collectiveGoalTitle,
        notifications
      }
      return collectiveGoal
    })
  })
  return Promise.all(promises)
}

async function getCollectiveGoalNotifications(collectiveGoalId: string, fromDate: Date): Promise<Notification[]> {
  const notificationsSnap = await db
    .collection(`ColleciveGoals/${collectiveGoalId}/Notifications`)
    .where('createdAt', '>=', fromDate)
    .orderBy('createdAt')
    .get()

  return notificationsSnap.docs.map(doc => createNotification(doc.data()))
}

async function getUserData(uid: string, fromDate: Date): Promise<User> {
  const [ profile, notifications ] = await Promise.all([
    getDocument<Profile>(`Users/${uid}/Profile/${uid}`),
    db.collection(`Users/${uid}/Notifications`)
      .where('createdAt', '>=', fromDate)
      .get()
      .then(notifications => notifications.docs.map(doc => createNotification(doc.data())).filter(notifications => notifications.event >= 40000 && notifications.event < 50000))
  ])

  return {
    uid,
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

  const msg: MailDataRequired = {
    to: 'remcosimonides@gmail.com',
    from: 'remco@strivejournal.com',
    subject: 'Weekly Update',
    text: mail
  }

  const config = functions.config()
  sgMail.setApiKey(config.sendgrid.apikey)

  try {
    console.log('going to send email template: ', JSON.stringify(msg));
    await sgMail.send(msg)
    console.log('sent 🙂')
  } catch (err) {
    console.log('err: ', err)
  }
}

async function sendTemplateEmail(to: string, templateId: string, data: Record<string, any>) {

  const config = functions.config()
  sgMail.setApiKey(config.sendgrid.apikey)

  const msg: MailDataRequired = {
    from: 'remco@strivejournal.com',
    to: 'remcosimonides@gmail.com',
    templateId: TEMPLATE_ID,
    dynamicTemplateData: { ...data }
  }

  try {
    console.log('going to send email template: ', JSON.stringify(msg));
    await sgMail.send(msg)
    console.log('sent 🙂')
  } catch (err) {
    console.log('err: ', err)
  }
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
  uid: string;
  username: string;
  notifications: Notification[];
}