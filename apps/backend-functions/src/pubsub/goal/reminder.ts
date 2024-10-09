import type { Message } from 'firebase-admin/messaging'
import { admin } from '@strive/api/firebase'
import { Personal, Reminder } from '@strive/model'
import { nextReminder } from '../../firestore/goals/goal-stakeholder/reminders/reminder'
import { enumWorkerType, ScheduledTaskGoalReminder } from '../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'
import { getDocument } from '../../shared/utils'

export async function sendReminderPushNotification(goalId: string, userId: string, reminder: Reminder) {

  const personal = await getDocument<Personal>(`Users/${userId}/Personal/${userId}`)
  if (!personal?.fcmTokens.length) return
  const { main, goalGeneral } = personal.settings.pushNotification
  if (!main || !goalGeneral) return

  const link = `goals?reminder=${encodeURI(goalId)}`
  const messages: Message[] = personal.fcmTokens.map(token => ({
    token,
    notification: {
      title: reminder.description,
      body: 'Click to add post to story...'
    },
    data: { link },
    webpush: {
      fcmOptions: { link }
    }
  }))
  if (!messages.length) return
  return admin.messaging().sendEach(messages)
}

export async function scheduleNextGoalReminder(goalId: string, userId: string, reminderId: string, reminder: Reminder) {

  if (!reminder.isRepeating) return

  const performAt = nextReminder(reminder)
  const id = `${goalId}${reminderId}`
  const task: ScheduledTaskGoalReminder = {
    worker: enumWorkerType.goalReminder,
    performAt,
    options: {
      userId,
      goalId,
      reminderId,
      description: reminder.description
    },
    status: 'scheduled'
  }
  return upsertScheduledTask(id, task)
}