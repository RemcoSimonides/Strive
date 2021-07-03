import * as moment from 'moment'
import { sendNotificationToUsers } from '../../shared/notification/notification';
import { ScheduledTaskUserExerciseBucketList, enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface';
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task';
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumEvent } from '@strive/notification/+state/notification.firestore';

export async function sendBucketListYearlyReminder(uid: string) {

  const notification = createNotification({
    discussionId: `${uid}bucketlist`,
    event: enumEvent.userExerciseBucketListYearlyReminder,
    source: {
      image: 'assets/exercises/bucketlist/bucketlist.jpg',
      name: 'Your Bucketlist',
      userId: uid
    },
    message: [
      {
        text: `It's been a year since you last updated your Bucket List. How is it going? Are you still focussed in life in completing this list? Or does it need an update? Schedule a moment for yourself to review`
      }
    ]
  })
  sendNotificationToUsers(notification, [uid])
}

export async function rescheduleYearlyReminder(uid: string) {

  const nextYear: string = moment(new Date()).add(1, 'year').toISOString()

  const task: Partial<ScheduledTaskUserExerciseBucketList> = {
    worker: enumWorkerType.userExerciseBucketListYearlyReminder,
    performAt: nextYear,
    options: {
        userId: uid
    }
  }
  await upsertScheduledTask(`${uid}bucketlist`, task)
}