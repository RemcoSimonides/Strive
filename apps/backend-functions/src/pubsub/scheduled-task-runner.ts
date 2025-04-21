import { db, admin, onSchedule } from '@strive/api/firebase'

import { getDocument } from '../shared/utils'
import { addGoalEvent } from '../shared/goal-event/goal.events'
import {
  enumWorkerType,
  ScheduledTaskGoalDeadline,
  ScheduledTaskGoalInviteLinkDeadline,
  ScheduledTaskMilestoneDeadline,
  ScheduledTaskUserExerciseAffirmations,
  ScheduledTaskUserExerciseSelfReflect,
  ScheduledTaskUserExerciseDailyGratitude,
  ScheduledTaskUserExerciseDearFutureSelfMessage,
  ScheduledTaskUserExerciseWheelOfLife,
  ScheduledTaskGoalReminder
} from '../shared/scheduled-task/scheduled-task.interface'
import { updateAggregation } from '../shared/aggregation/aggregation'

import { sendDailyGratitudePushNotification, scheduleNextDailyGratitudeReminder } from './user-exercises/daily_gratitude'
import { sendAffirmationPushNotification, scheduleNextAffirmation } from './user-exercises/affirmations'
import { scheduleNextReminder, sendWheelOfLifePushNotification } from './user-exercises/wheel_of_life'
import { sendDearFutureSelfEmail, sendDearFutureSelfPushNotification } from './user-exercises/dear_future_self'

import { DearFutureSelf, Personal, Affirmations, WheelOfLifeSettings, createGoalSource, SelfReflectSettings, Reminder } from '@strive/model'
import { AES, enc } from 'crypto-js'
import { scheduleNextSelfReflectReminder, sendSelfReflectPuthNotification } from './user-exercises/self_reflect'
import { scheduleNextGoalReminder, sendReminderPushNotification } from './goal/reminder'

// https://fireship.io/lessons/cloud-functions-scheduled-time-trigger/
// crontab.guru to determine schedule value
export const scheduledTasksRunner = onSchedule('every 1 minutes', async () => {

  // Consistent timestamp
  const now = admin.firestore.Timestamp.now()

  // Query all documents ready to perform
  const query = db.collection('ScheduledTasks').where('performAt', '<=', now).where('status', '==', 'scheduled')

  const tasks = await query.get()

  // Jobs to execute concurrently.
  const jobs: Promise<any>[] = []

  const reschedulingTasks = [
    enumWorkerType.userExerciseAffirmation,
    enumWorkerType.userExerciseDailyGratitudeReminder,
    enumWorkerType.userExerciseWheelOfLifeReminder,
    enumWorkerType.userExerciseSelfReflect,
    enumWorkerType.goalReminder
  ]

  // Loop over documents and push job.
  for (const snapshot of tasks.docs) {
    const { worker, options } = snapshot.data()

    if (!workers[worker]) {
      console.error('WORKER NOT FOUND FOR: ', worker, snapshot.id)
      continue
    }
    const job = workers[worker](options)
      // Update doc with status on success or error
      .then(async () => {
        if (reschedulingTasks.some(task => task === worker)) return
        await snapshot.ref.update({ status: 'complete' })
      })
      .catch(async (error) => {
        await snapshot.ref.update({ status: 'error' })
        throw error
      })
    jobs.push(job)
  }

  // Execute all jobs concurrently
  return await Promise.all(jobs)
}, { memory: '2GiB' } );

// Optional interface, all worker functions should return Promise.
interface IWorkers {
  [key: string]: (options: any) => Promise<any>
}

// Business logic for named tasks. Function name should match worker field on task document.
const workers: IWorkers = {
  deleteInviteLinkGoal: (options) => deleteInviteLinkGoal(options),
  goalDeadline: (options) => goalDeadlineHandler(options),
  goalReminder: goalReminderHandler,
  milestoneDeadline: (options) => milestoneDeadlineHandler(options),
  userExerciseAffirmation: (options) => userExerciseAffirmationsHandler(options),
  userExerciseDailyGratitudeReminder: (options) => userExerciseDailyGratitudeReminderHandler(options),
  userExerciseDearFutureSelfMessage: (options) => userExerciseDearFutureSelfMessageHandler(options),
  userExerciseWheelOfLifeReminder: (options) => userExerciseWheelOfLifeReminderHandler(options),
  userExerciseSelfReflect: (options) => userExerciseSelfReflectHandler(options)
}

function deleteInviteLinkGoal(options: ScheduledTaskGoalInviteLinkDeadline['options']) {
  return db.doc(`Goals/${options.goalId}/InviteTokens/${options.inviteTokenId}`).delete()
}

function goalDeadlineHandler({ goalId }: ScheduledTaskGoalDeadline['options']) {
  const source = createGoalSource({ goalId })
  return addGoalEvent('goalDeadlinePassed', source)
}

async function goalReminderHandler({ goalId, userId, reminderId }: ScheduledTaskGoalReminder['options']) {
  const reminder = await getDocument<Reminder>(`Goals/${goalId}/GStakeholders/${userId}/Reminders/${reminderId}`)

  return Promise.all([
    sendReminderPushNotification(goalId, userId, reminder),
    scheduleNextGoalReminder(goalId, userId, reminderId, reminder)
  ])
}

function milestoneDeadlineHandler({ goalId, milestoneId }: ScheduledTaskMilestoneDeadline['options']) {
  const source = createGoalSource({ goalId, milestoneId })
  return addGoalEvent('goalMilestoneDeadlinePassed', source)
}

async function userExerciseAffirmationsHandler(options: ScheduledTaskUserExerciseAffirmations['options']) {
  const affirmations = await getDocument<Affirmations>(`Users/${options.userId}/Exercises/Affirmations`)

  return Promise.all([
    sendAffirmationPushNotification(options.userId, affirmations),
    scheduleNextAffirmation(options.userId, affirmations)
  ])
}

function userExerciseDailyGratitudeReminderHandler(options: ScheduledTaskUserExerciseDailyGratitude['options']) {
  return Promise.all([
    sendDailyGratitudePushNotification(options.userId),
    scheduleNextDailyGratitudeReminder(options.userId)
  ])
}

async function userExerciseDearFutureSelfMessageHandler(options: ScheduledTaskUserExerciseDearFutureSelfMessage['options']) {
  const dearFutureSelf = await getDocument<DearFutureSelf>(`Users/${options.userId}/Exercises/DearFutureSelf`)
  const message = dearFutureSelf.messages[options.index]

  const personal = await getDocument<Personal>(`Users/${options.userId}/Personal/${options.userId}`)
  const description = AES.decrypt(message.description, personal.key).toString(enc.Utf8)

  return Promise.all([
    sendDearFutureSelfPushNotification(personal, message),
    sendDearFutureSelfEmail(personal, description),
    updateAggregation({ usersFutureLetterReceived: 1 })
  ])
}

async function userExerciseWheelOfLifeReminderHandler(options: ScheduledTaskUserExerciseWheelOfLife['options']) {
  const settings = await getDocument<WheelOfLifeSettings>(`Users/${options.userId}/Exercises/WheelOfLife`)

  return Promise.all([
    sendWheelOfLifePushNotification(options.userId),
    scheduleNextReminder(settings, options.userId)
  ])
}

async function userExerciseSelfReflectHandler(options: ScheduledTaskUserExerciseSelfReflect['options']) {
  const settings = await getDocument<SelfReflectSettings>(`Users/${options.userId}/Exercises/SelfReflect`)
  return Promise.all([
    sendSelfReflectPuthNotification(settings, options),
    scheduleNextSelfReflectReminder(settings, options.userId)
  ])
}