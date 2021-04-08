import { functions } from '../../../internals/firebase';
import * as moment from 'moment'
import { BucketList } from '@strive/exercises/bucket-list/+state/bucket-list.firestore';
import { enumWorkerType, IScheduledTaskUserExerciseBucketList } from '../../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { handleNotificationsOfBucketListChanged, handleNotificationsOfBucketListCreated } from './bucketlist.notification'

export const bucketListCreatedHandler = functions.firestore.document(`Users/{userId}/Exercises/BucketList`)
  .onCreate(async (snapshot, context) => {

    const uid = context.params.userId
    const nextYear = moment(snapshot.createTime).add(1, 'year').toISOString()

    handleNotificationsOfBucketListCreated(uid)

    // create scheduled task in a year to reassess bucket list
    const task: IScheduledTaskUserExerciseBucketList = {
      worker: enumWorkerType.userExerciseBucketListYearlyReminder,
      performAt: nextYear,
      options: { userId: uid }
    }
    upsertScheduledTask(`${uid}bucketlist`, task)
  })

export const bucketListChangeHandler = functions.firestore.document(`Users/{userId}/Exercises/BucketList`)
  .onUpdate(async (snapshot, context) => {

    const before = snapshot.before.data() as BucketList
    const after = snapshot.after.data() as BucketList
    const uid = context.params.userId

    if (before !== after) {
      handleNotificationsOfBucketListChanged(uid, before, after)
    }
  })
