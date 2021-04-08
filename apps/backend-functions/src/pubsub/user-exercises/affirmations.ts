import { admin } from '../../internals/firebase';
import * as moment from 'moment'
import { Affirmations } from '@strive/exercises/affirmation/+state/affirmation.firestore';
import { Profile } from '@strive/user/user/+state/user.firestore';
import { IScheduledTaskUserExerciseAffirmations, enumWorkerType, enumTaskStatus } from '../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'
import { getDocument } from '../../shared/utils';

export async function sendAffirmationPushNotification(uid: string, affirmations: Affirmations) {

  if  (affirmations.affirmations.length >= 1) {

    const randomAffirmation = affirmations.affirmations[Math.floor(Math.random() * affirmations.affirmations.length)];
    const profile = await getDocument<Profile>(`Users/${uid}/Profile/${uid}`)

    if (!!profile.fcmTokens.length) {
      return admin.messaging().sendToDevice(profile.fcmTokens as string[], {
        notification: {
          title: `Repeat out loud 5 times`,
          body: `${randomAffirmation}`,
          clickAction: 'affirmation'
        }
      })
    }
  }
}

export async function scheduleNextAffirmation(uid: string, affirmations: Affirmations) {

  const nextAffirmationDateTime = getNextAffirmationDate(affirmations)
  const task: IScheduledTaskUserExerciseAffirmations = {
    worker: enumWorkerType.userExerciseAffirmation,
    performAt: nextAffirmationDateTime,
    options: { userId: uid },
    status: enumTaskStatus.scheduled
  }
  return upsertScheduledTask(`${uid}affirmations`, task) 
}

export function getNextAffirmationDate(affirmations: Affirmations): string {

  const currentDate = new Date()
  const dates: Date[] = []

  for (const time of  affirmations.times) {

    const d = new Date(time)
    const x = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), d.getHours(), d.getMinutes())

    if (x.getTime() < currentDate.getTime()) {
      dates.push(moment(x).add(1, 'day').toDate())
    } else {
      dates.push(x)
    }
  }

  let nextDate: Date = new Date(dates[0])
  for (let i = 1; i < dates.length; i++ ) {
      
    const d = new Date(dates[i])
    if (d.getTime() < nextDate.getTime()) nextDate = new Date(dates[i])

  }

  return nextDate.toISOString()
}