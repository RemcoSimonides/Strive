import { admin } from '../../internals/firebase'
import { addWeeks, addMonths, addQuarters, addYears } from 'date-fns'
import { Personal, WheelOfLifeSettings } from '@strive/model'
import { enumWorkerType, ScheduledTaskUserExerciseWheelOfLife } from '../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'
import { getDocument } from '../../shared/utils'

export async function sendWheelOfLifePushNotification(uid: string) {

  const personal = await getDocument<Personal>(`Users/${uid}/Exercises/WheelOfLife`)

  if (personal?.fcmTokens.some(token => token)) {
    return admin.messaging().sendToDevice(personal.fcmTokens, {
      notification: {
        title: `Wheel of Life reminder`,
        body: `It's time again to fill in the wheel of life`,
        icon: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9',
        clickAction: `goals?t=wheeloflife`
      }
    })
  }
}

export async function scheduleNextReminder(settings: WheelOfLifeSettings, userId: string) {

  let performAt = undefined
  const now = new Date().setHours(8)
  if (settings.interval === 'weekly') performAt = addWeeks(now, 1)
  if (settings.interval === 'monthly') performAt = addMonths(now, 1)
  if (settings.interval === 'quarterly') performAt = addQuarters(now, 1)
  if (settings.interval === 'yearly') performAt = addYears(now, 1)
    
  const task: ScheduledTaskUserExerciseWheelOfLife = {
    worker: enumWorkerType.userExerciseWheelOfLifeReminder,
    performAt,
    options: { userId },
    status: 'scheduled'
  }
  return upsertScheduledTask(`${userId}wheeloflife`, task)
}
