import { AssessLifeSettings, Personal, getInterval } from '@strive/model'
import type { Message } from 'firebase-admin/messaging'
import { getDocument } from '../../shared/utils'
import { admin } from '@strive/api/firebase'
import { ScheduledTaskUserExerciseAssessLife, enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface'
import { smartJoin } from '@strive/utils/helpers'
import { getNextReminder } from '../../firestore/users/exercises/assess_life'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'

export async function sendAssessLifePuthNotification(options: ScheduledTaskUserExerciseAssessLife['options']) {

  const { userId, intervals } = options

  const converted = intervals.map(interval => getInterval(interval))
  const readable = smartJoin(converted, ', ', ' and ')
  const firstLetters = intervals.map(interval => interval[0]).join('')

  const personal = await getDocument<Personal>(`Users/${userId}/Personal/${userId}`)
  const link = `goals?assess=${firstLetters}`
  const messages: Message[] = personal.fcmTokens.map(token => ({
    token,
    notification: {
      title: `Time to Assess Life`,
      body: `Take a moment to do the ${readable} assessment`
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

export async function scheduleNextAssessLifeReminder(settings: AssessLifeSettings, userId: string) {
  const { performAt, performIntervals: intervals } = getNextReminder(settings)

  const task: ScheduledTaskUserExerciseAssessLife = {
    worker: enumWorkerType.userExerciseAssessLife,
    performAt,
    options: { userId, intervals },
    status: 'scheduled'
  }
  return upsertScheduledTask(`${userId}assesslife`, task)
}