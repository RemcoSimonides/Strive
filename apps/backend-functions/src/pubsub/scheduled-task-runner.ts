import { db, functions, admin, logger } from '../internals/firebase'
import { wrapPubsubOnRunHandler } from '../internals/sentry'

import { getDocument } from '../shared/utils'
import { 
  enumWorkerType,
  ScheduledTaskGoalInviteLinkDeadline,
  ScheduledTaskMilestoneDeadline,
  ScheduledTaskUserExerciseAffirmations,
  ScheduledTaskUserExerciseDailyGratefulness,
  ScheduledTaskUserExerciseDearFutureSelfMessage
} from '../shared/scheduled-task/scheduled-task.interface'
import { updateAggregation } from '../shared/aggregation/aggregation'

import { sendDailyGratefulnessPushNotification, scheduleNextDailyGratefulnessReminder } from './user-exercises/daily_gratefulness'
import { sendAffirmationPushNotification, scheduleNextAffirmation } from './user-exercises/affirmations'
import { sendDearFutureSelfEmail, sendDearFutureSelfPushNotification } from './user-exercises/dear_future_self'

import { DearFutureSelf, Personal, Affirmations } from '@strive/model'
import { AES, enc } from 'crypto-js'

// https://fireship.io/lessons/cloud-functions-scheduled-time-trigger/
// crontab.guru to determine schedule value
export const scheduledTasksRunner = functions({ memory: '2GB' }).pubsub.schedule('* * * * *').onRun(wrapPubsubOnRunHandler('scheduledTasksRunner',
async () => {

  // Consistent timestamp
  const now = admin.firestore.Timestamp.now();

  // Query all documents ready to perform
  const query = db.collection('ScheduledTasks').where('performAt', '<=', now).where('status', '==', 'scheduled')

  const tasks = await query.get()
  
  // Jobs to execute concurrently.
  const jobs: Promise<any>[] = []

  const reschedulingTasks = [
    enumWorkerType.userExerciseAffirmation,
    enumWorkerType.userExerciseDailyGratefulnessReminder
  ]

  // Loop over documents and push job.
  for (const snapshot of tasks.docs) {
    const { worker, options } = snapshot.data()

    if (!workers[worker]) {
      console.error('WORKER NOT FOUND FOR: ', worker)
      continue
    }
    const job = workers[worker](options)      
      // Update doc with status on success or error
      .then(async () => {
        if (reschedulingTasks.some(task => task === worker)) return
        await snapshot.ref.update({ status: 'complete' })
      })
      .catch(async () => {
        if (reschedulingTasks.some(task => task === worker)) return
        await snapshot.ref.update({ status: 'error' })
      });
      jobs.push(job);
  }


  // Execute all jobs concurrently
  return await Promise.all(jobs)
}))

// Optional interface, all worker functions should return Promise.
interface IWorkers {
  [key: string]: (options: any) => Promise<any>
}

// Business logic for named tasks. Function name should match worker field on task document. 
const workers: IWorkers = {
  deleteInviteLinkGoal: (options) => deleteInviteLinkGoal(options),
  milestoneDeadline: (options) => milestoneDeadlineHandler(options),
  userExerciseAffirmation: (options) => userExerciseAffirmationsHandler(options),
  userExerciseDailyGratefulnessReminder: (options) => userExerciseDailyGratefulnessReminderHandler(options),
  userExerciseDearFutureSelfMessage: (options) => userExerciseDearFutureSelfMessageHandler(options)
}

function deleteInviteLinkGoal(options: ScheduledTaskGoalInviteLinkDeadline['options']) {
  return db.doc(`Goals/${options.goalId}/InviteTokens/${options.inviteTokenId}`).delete()
}

async function milestoneDeadlineHandler(options: ScheduledTaskMilestoneDeadline['options']) {
  // set status to overdue
  return db.doc(`Goals/${options.goalId}/Milestones/${options.milestoneId}`).update({
    status: 'overdue'
  })
}

async function userExerciseAffirmationsHandler(options: ScheduledTaskUserExerciseAffirmations['options']) {
  // get affirmation
  const affirmations = await getDocument<Affirmations>(`Users/${options.userId}/Exercises/Affirmations`)

  // send push notification
  sendAffirmationPushNotification(options.userId, affirmations)

  // reschedule task for tomorrow
  scheduleNextAffirmation(options.userId, affirmations)
}

async function userExerciseDailyGratefulnessReminderHandler(options: ScheduledTaskUserExerciseDailyGratefulness['options']) {
  // send push notification
  sendDailyGratefulnessPushNotification(options.userId)

  // reschedule task for tomorrow
  logger.log('scheduling for tomorrow userExerciseDailyGratefulnessReminderHandler')
  scheduleNextDailyGratefulnessReminder(options.userId)
}

async function userExerciseDearFutureSelfMessageHandler(options: ScheduledTaskUserExerciseDearFutureSelfMessage['options']) {
  const dearFutureSelf = await getDocument<DearFutureSelf>(`Users/${options.userId}/Exercises/DearFutureSelf`)
  const message = dearFutureSelf.messages[options.index]

  const personal = await getDocument<Personal>(`Users/${options.userId}/Personal/${options.userId}`)
  const description = AES.decrypt(message.description, personal.key).toString(enc.Utf8)

  sendDearFutureSelfPushNotification(personal, message)
  sendDearFutureSelfEmail(personal, description)

  updateAggregation({ usersFutureLetterReceived: 1 })
}