import { admin } from '../../internals/firebase';
import { set, isPast, addDays, closestTo } from 'date-fns'
import { Affirmations, Personal } from '@strive/model'
import { ScheduledTaskUserExerciseAffirmations, enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'
import { getDocument } from '../../shared/utils';

export async function sendAffirmationPushNotification(uid: string, affirmations: Affirmations) {

  if  (affirmations.affirmations.length >= 1) {

    const randomAffirmation = affirmations.affirmations[Math.floor(Math.random() * affirmations.affirmations.length)];
    const personal = await getDocument<Personal>(`Users/${uid}/Personal/${uid}`)

    const clickAction = `?affirm=${encodeURI(randomAffirmation)}`

    if (personal?.fcmTokens.some(token => token)) {
      return admin.messaging().sendToDevice(personal.fcmTokens, {
        notification: {
          title: `Repeat out loud 5 times`,
          body: `${randomAffirmation}`,
          icon: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9',
          clickAction
        }
      })
    }
  }
}

export async function scheduleNextAffirmation(userId: string, affirmations: Affirmations) {

  const performAt = getNextAffirmationDate(affirmations)
  const task: ScheduledTaskUserExerciseAffirmations = {
    worker: enumWorkerType.userExerciseAffirmation,
    performAt,
    options: { userId },
    status: 'scheduled'
  }
  return upsertScheduledTask(`${userId}affirmations`, task)
}

export function getNextAffirmationDate(affirmations: Affirmations): string {
  const now = new Date()
  
  const times = affirmations.times.filter(time => time !== '')
  const dates = times
    // set date to today
    .map(time => set(new Date(time), { year: now.getFullYear(), month: now.getMonth(), date: now.getDate() }))
    // set date to future
    .map(date => isPast(date) ? addDays(date, 1) : date)

  return closestTo(now, dates).toISOString()
}