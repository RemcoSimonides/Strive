import { admin } from '@strive/api/firebase'
import type { Message } from 'firebase-admin/messaging'
import { addWeeks, addMonths, addQuarters, addYears } from 'date-fns'
import { Personal, WheelOfLifeSettings } from '@strive/model'
import { enumWorkerType, ScheduledTaskUserExerciseWheelOfLife } from '../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'
import { getDocument } from '../../shared/utils'

export async function sendWheelOfLifePushNotification(uid: string) {

  const personal = await getDocument<Personal>(`Users/${uid}/Personal/${uid}`)
  const link = 'goals?t=wheeloflife'
  const messages: Message[] = personal.fcmTokens.map(token => ({
    token,
    notification: {
      title: 'Wheel of Life reminder',
      body: `It's time to fill in the wheel of life`
    },
    data: { link },
    webpush: {
      notification: {
        icon: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9',
      },
      fcmOptions: { link }
    }
  }))
  if (!messages.length) return
  return admin.messaging().sendEach(messages)
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
