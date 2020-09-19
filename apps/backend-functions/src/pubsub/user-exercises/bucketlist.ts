import * as moment from 'moment'
import { sendNotificationToUsers } from '../../shared/notification/notification';
import { INotificationBase, enumEvent } from '@strive/interfaces';
import { IScheduledTaskUserExerciseBucketList, enumWorkerType } from '../../shared/scheduled-task/scheduled-task.interface';
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task';

export async function sendBucketListYearlyReminder(uid: string): Promise<void> {

    const notification: Partial<INotificationBase> = {
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
    }
    await sendNotificationToUsers(notification, [uid])

}

export async function rescheduleYearlyReminder(uid: string): Promise<void> {

    const nextYear: string = moment(new Date()).add(1, 'year').toISOString()

    const task: IScheduledTaskUserExerciseBucketList = {
        worker: enumWorkerType.userExerciseBucketListYearlyReminder,
        performAt: nextYear,
        options: {
            userId: uid
        }
    }
    await upsertScheduledTask(`${uid}bucketlist`, task)

}