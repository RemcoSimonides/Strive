import { functions } from '../../../internals/firebase';
import * as moment from 'moment'
import { DailyGratefulness } from '@strive/exercises/daily-gratefulness/+state/daily-gratefulness.firestore'
import { ScheduledTaskUserExerciseDailyGratefulness, enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'

export const dailyGratefulnessCreatedHandler = functions.firestore.document(`Users/{uid}/Exercises/DailyGratefulness`)
  .onCreate(async (snapshot, context) => {

    const uid = context.params.uid
    const dailyGratefulnessSettings = snapshot.data() as DailyGratefulness
    if (!dailyGratefulnessSettings) return
    if (!dailyGratefulnessSettings.on) return

    scheduleScheduledTask(uid, dailyGratefulnessSettings)
  })

export const dailyGratefulnessChangedHandler = functions.firestore.document(`Users/{uid}/Exercises/DailyGratefulness`)
  .onUpdate(async (snapshot, context) => {

    const uid = context.params.uid
    const before = snapshot.before.data() as DailyGratefulness
    const after = snapshot.after.data() as DailyGratefulness

    if (before.on !== after.on) {
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

async function scheduleScheduledTask(uid: string, dailyGratefulnessSettings: DailyGratefulness) {

    const hours = new Date().getHours()
    const [ setHours, setMinutes ] = dailyGratefulnessSettings.time.split(':').map(time => +time)
    const scheduledDate = moment(new Date().setHours(setHours, setMinutes))

    if (hours > setHours) {
      // time passed so set date to tomorrow
      scheduledDate.add(1, 'day')
    }

    const task: Partial<ScheduledTaskUserExerciseDailyGratefulness> = {
      worker: enumWorkerType.userExerciseDailyGratefulnessReminder,
      performAt: scheduledDate.toISOString(),
      options: { userId: uid }
    }

    return upsertScheduledTask(`${uid}dailygratefulness`, task)
}