import { SelfReflectSettings, Personal, getInterval } from '@strive/model'
import type { Message } from 'firebase-admin/messaging'
import { getDocument } from '../../shared/utils'
import { admin } from '@strive/api/firebase'
import { ScheduledTaskUserExerciseSelfReflect, enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface'
import { smartJoin } from '@strive/utils/helpers'
import { getNextReminder } from '../../firestore/users/exercises/self_reflect'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'

export async function sendSelfReflectPuthNotification(options: ScheduledTaskUserExerciseSelfReflect['options']) {

  const { userId, intervals } = options

  const converted = intervals.map(interval => getInterval(interval))
  const readable = smartJoin(converted, ', ', ' and ')
  const firstLetters = intervals.map(interval => interval[0]).join('')

  const personal = await getDocument<Personal>(`Users/${userId}/Personal/${userId}`)
  const link = `goals?reflect=${firstLetters}`
  const messages: Message[] = personal.fcmTokens.map(token => ({
    token,
    notification: {
      title: `Time to Self Reflect`,
      body: `Take a moment to do the ${readable} reflection`
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

export async function scheduleNextSelfReflectReminder(settings: SelfReflectSettings, userId: string) {
  const { performAt, performIntervals: intervals } = getNextReminder(settings)

  const task: ScheduledTaskUserExerciseSelfReflect = {
    worker: enumWorkerType.userExerciseSelfReflect,
    performAt,
    options: { userId, intervals },
    status: 'scheduled'
  }
  return upsertScheduledTask(`${userId}selfreflect`, task)
}