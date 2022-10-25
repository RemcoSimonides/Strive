import * as admin from 'firebase-admin'
import type { Message } from 'firebase-admin/messaging'
import { ScheduledTaskUserExerciseDailyGratefulness, enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'
import { DailyGratefulness, Personal } from '@strive/model'
import { getDocument } from '../../shared/utils'
import { addDays } from 'date-fns'

// Sentences to ask in push notification
// Close your eyes and take a moment to reflect on all the good things that happened today or yesterday
// Pause for a moment and think of 3 things that you are grateful for in this moment
// Pick a random photo, and write about  why you're grateful for that memory
// What is a special memory from your childhood?
// What is something beautiful that you saw today?
// What is something that you are looking forward to?
// What is something that was hard to do but you did anyway?
// What is something you love in nature?
// What made you smile today?
// What was the best part of today?
// What was the best thing that happened to today or yesterday?
// When did you feel grateful today?
// Write a thank you note to yourself
// Write about a person who helped you through a tough situation
// Write about a time you were grateful for something a loved one did for you
// Write about an activity that you enjoyed the most today
// Write about someone who you felt happy to meed with today
// Write about someone who helped you today
// Write about someone who has really helped you this week
// Write about someone who was kind to you today or yesterday
// Write about something that you are excited for in the future
// Write about something you read or listened to today that added value to your life
// Write about something valuable that you learned today
// Write about the positive emotions you felt today
// Write about things that made you smile this week
// Write and share a Letter of Gratitude to someone who's brought a positive difference in your life
// Write three things down what you did well that day

export async function sendDailyGratefulnessPushNotification(uid: string) {

  const personal = await getDocument<Personal>(`Users/${uid}/Personal/${uid}`)
  if (!personal.fcmTokens) return
  
  const link = 'goals?t=daily-gratefulness'
  const messages: Message[] = personal.fcmTokens.map(token => ({
    token,
    notification: {
      title: `Daily Gratefulness Reminder`,
      body: `Name three things you were grateful for today`,
    },
    data: { link },
    webpush: {
      notification: {
        icon: 'https://firebasestorage.googleapis.com/v0/b/strive-journal.appspot.com/o/FCMImages%2Ficon-72x72.png?alt=media&token=19250b44-1aef-4ea6-bbaf-d888150fe4a9',
      },
      fcmOptions: { link }
    }
  }))
  return admin.messaging().sendAll(messages)

}

export async function scheduleNextDailyGratefulnessReminder(uid: string) {

  const settings = await getDocument<DailyGratefulness>(`Users/${uid}/Exercises/DailyGratefulness`)

  const hours = settings.time.getHours()
  const minutes = settings.time.getMinutes()
  const now = new Date().setHours(hours, minutes)

  const performAt = addDays(now, 1)

  const task: ScheduledTaskUserExerciseDailyGratefulness = {
    worker: enumWorkerType.userExerciseDailyGratefulnessReminder,
    performAt,
    options: { userId: uid },
    status: 'scheduled'
  }

  return upsertScheduledTask(`${uid}dailygratefulness`, task) 
}