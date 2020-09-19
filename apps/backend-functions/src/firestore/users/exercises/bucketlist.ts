import { functions } from '../../../internals/firebase';
import * as moment from 'moment'
import { IBucketList } from '@strive/interfaces';
import { enumWorkerType, IScheduledTaskUserExerciseBucketList } from '../../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { handleNotificationsOfBucketListChanged, handleNotificationsOfBucketListCreated } from './bucketlist.notification'

export const bucketListCreatedHandler = functions.firestore.document(`Users/{userId}/Exercises/BucketList`)
    .onCreate(async (snapshot, context) => {

        const uid = context.params.userId
        const affirmations: IBucketList = Object.assign(<IBucketList>{}, snapshot.data())
        if (!affirmations) return

        const nextYear: string = moment(snapshot.createTime).add(1, 'year').toISOString()

        await handleNotificationsOfBucketListCreated(uid)

        // create scheduled task in a year to reassess bucket list
        const task: IScheduledTaskUserExerciseBucketList = {
            worker: enumWorkerType.userExerciseBucketListYearlyReminder,
            performAt: nextYear,
            options: {
                userId: uid
            }
        }

        await upsertScheduledTask(`${uid}bucketlist`, task)


    })

export const bucketListChangeHandler = functions.firestore.document(`Users/{userId}/Exercises/BucketList`)
    .onUpdate(async (snapshot, context) => {

        const before: IBucketList = Object.assign(<IBucketList>{}, snapshot.before.data())
        const after: IBucketList = Object.assign(<IBucketList>{}, snapshot.after.data())
        const uid = context.params.userId

        if (before !== after) {

            await handleNotificationsOfBucketListChanged(uid, before, after)

        }

    })

