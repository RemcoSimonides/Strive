import { functions } from '../../../internals/firebase';
import { DailyGratefulness } from '@strive/model'
import { ScheduledTaskUserExerciseDailyGratefulness, enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { updateAggregation } from '../../../shared/aggregation/aggregation';

export const dailyGratefulnessCreatedHandler = functions.firestore.document(`Users/{uid}/Exercises/DailyGratefulness`)
  .onCreate(async (snapshot, context) => {

    const uid = context.params.uid
    const dailyGratefulnessSettings = snapshot.data() as DailyGratefulness
    if (!dailyGratefulnessSettings?.on) return

    // aggregation
    updateAggregation({ usersGratefulnessOn: 1 })

    scheduleScheduledTask(uid, dailyGratefulnessSettings)
  })

export const dailyGratefulnessChangedHandler = functions.firestore.document(`Users/{uid}/Exercises/DailyGratefulness`)
  .onUpdate(async (snapshot, context) => {

    const uid = context.params.uid
    const before = snapshot.before.data() as DailyGratefulness
    const after = snapshot.after.data() as DailyGratefulness

    if (before.on !== after.on) {
      updateAggregation({ usersGratefulnessOn: after.on ? 1 : -1 })

      if (after.on) {
        //  create task
        scheduleScheduledTask(uid, after)
      } else {
        // delete task
        deleteScheduledTask(`${uid}dailygratefulness`)
      }
    } else if (before.time !== after.time) {
      scheduleScheduledTask(uid, after)
    }
  })

async function scheduleScheduledTask(userId: string, setting: DailyGratefulness) {


    const task: Partial<ScheduledTaskUserExerciseDailyGratefulness> = {
      worker: enumWorkerType.userExerciseDailyGratefulnessReminder,
      performAt: setting.time,
      options: { userId }
    }

    return upsertScheduledTask(`${userId}dailygratefulness`, task)
}