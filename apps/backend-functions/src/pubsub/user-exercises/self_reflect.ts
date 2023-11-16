import { SelfReflectSettings, Personal, getFrequency, replaceFrequency } from '@strive/model'
import type { Message } from 'firebase-admin/messaging'
import { getDocument } from '../../shared/utils'
import { admin } from '@strive/api/firebase'
import { ScheduledTaskUserExerciseSelfReflect, enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface'
import { smartJoin } from '@strive/utils/helpers'
import { getNextReminder } from '../../firestore/users/exercises/self_reflect'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'

export async function sendSelfReflectPuthNotification(settings: SelfReflectSettings, options: ScheduledTaskUserExerciseSelfReflect['options']) {

  const { userId, frequencies } = options

  const questionsInFrequencies = settings.questions.filter(question => frequencies.includes(question.frequency))
  const randomIndex = Math.floor(Math.random() * questionsInFrequencies.length)
  const question = questionsInFrequencies[randomIndex]

  const converted = frequencies.map(frequency => getFrequency(frequency))
  const readable = smartJoin(converted, ', ', ' and ')
  const firstLetters = frequencies.map(frequency => frequency[0]).join('')

  const personal = await getDocument<Personal>(`Users/${userId}/Personal/${userId}`)
  const link = `goals?reflect=${firstLetters}`
  const messages: Message[] = personal.fcmTokens.map(token => ({
    token,
    notification: {
      title: replaceFrequency(question.question, question.frequency),
      body: `(Make) time to reflect the ${readable}`
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
  const { performAt, performFrequencies: frequencies } = getNextReminder(settings)

  const task: ScheduledTaskUserExerciseSelfReflect = {
    worker: enumWorkerType.userExerciseSelfReflect,
    performAt,
    options: { userId, frequencies },
    status: 'scheduled'
  }
  return upsertScheduledTask(`${userId}selfreflect`, task)
}