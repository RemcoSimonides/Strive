import { db, functions, admin } from '../internals/firebase';

import { Affirmations } from '@strive/exercises/affirmation/+state/affirmation.firestore';
import { sendNotificationMilestoneDeadlinePassed } from './notifications/milestone.notification';
import { sendAffirmationPushNotification, scheduleNextAffirmation } from './user-exercises/affirmations';
import { sendDailyGratefulnessPushNotification, scheduleNextDailyGratefulnessReminder } from './user-exercises/daily_gratefulness';
import { getDocument } from '../shared/utils';

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
    'userExerciseAffirmation',
    'userExerciseDailyGratefulness'
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
  userExerciseDailyGratefulnessReminder: (options) => userExerciseDailyGratefulnessReminderHandler(options)
}

function deleteInviteLinkGoal(options) {
  return db.doc(`Goals/${options.goalId}/InviteTokens/${options.inviteTokenId}`).delete()
}

async function milestoneDeadlineHandler(options) {

  // send notification to achievers
  await sendNotificationMilestoneDeadlinePassed(options.goalId, options.milestoneId)

  // set status to overdue
  return db.doc(`Goals/${options.goalId}/Milestones/${options.milestoneId}`).update({
    status: 'overdue'
  })
}

async function userExerciseAffirmationsHandler(options) {
  // get affirmation
  const affirmations = await getDocument<Affirmations>(`Users/${options.userId}/Exercises/Affirmations`)

  // send push notification
  sendAffirmationPushNotification(options.userId, affirmations)

  // reschedule task for tomorrow
  scheduleNextAffirmation(options.userId, affirmations)
}

async function userExerciseDailyGratefulnessReminderHandler(options) {
  // send push notification
  sendDailyGratefulnessPushNotification(options.userId)

  // reschedule task for tomorrow
  scheduleNextDailyGratefulnessReminder(options.userId)
}