import { db, functions, admin } from '../internals/firebase';

import { Affirmations } from '@strive/exercises/affirmation/+state/affirmation.firestore';
import { sendNotificationMilestoneDeadlinePassed } from './notifications/milestone.notification';
import { sendAffirmationPushNotification, scheduleNextAffirmation } from './user-exercises/affirmations';
import { sendDailyGratefulnessPushNotification, scheduleNextDailyGratefulnessReminder } from './user-exercises/daily_gratefulness';
import { logger } from 'firebase-functions';
import { getDocument } from '../shared/utils';
import { enumWorkerType, ScheduledTaskGoalInviteLinkDeadline, ScheduledTaskMilestoneDeadline, ScheduledTaskUserExerciseAffirmations, ScheduledTaskUserExerciseDailyGratefulness, ScheduledTaskUserExerciseDearFutureSelfMessage } from '../shared/scheduled-task/scheduled-task.interface';
import { sendDearFutureSelfEmail, sendDearFutureSelfPushNotification } from './user-exercises/dear_future_self';
import { DearFutureSelf } from '@strive/exercises/dear-future-self/+state/dear-future-self.firestore';
import { Personal } from '@strive/user/user/+state/user.firestore';

// https://fireship.io/lessons/cloud-functions-scheduled-time-trigger/
// crontab.guru to determine schedule value
export const scheduledTasksRunner = functions.runWith( { memory: '2GB' }).pubsub.schedule('* * * * *').onRun(async () => {

  // Consistent timestamp
  const now = admin.firestore.Timestamp.now();

  // Query all documents ready to perform
  const query = db.collection('ScheduledTasks').where('performAt', '<=', now).where('status', '==', 'scheduled');

  const tasks = await query.get();
  
  // Jobs to execute concurrently. 
  const jobs: Promise<any>[] = [];

  const reschedulingTasks = [
    enumWorkerType.userExerciseAffirmation,
    enumWorkerType.userExerciseDailyGratefulnessReminder
  ]

  // Loop over documents and push job.
  tasks.forEach(snapshot => {
    const { worker, options } = snapshot.data();

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
  });

  // Execute all jobs concurrently
  return await Promise.all(jobs);
})

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

  // send notification to achievers
  await sendNotificationMilestoneDeadlinePassed(options.goalId, options.milestoneId)

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
  const message = dearFutureSelf.messages[options.index];
  const personal = await getDocument<Personal>(`Users/${options.userId}/Personal/${options.userId}`)

  sendDearFutureSelfPushNotification(personal, message)
  sendDearFutureSelfEmail(personal, message.description)
}