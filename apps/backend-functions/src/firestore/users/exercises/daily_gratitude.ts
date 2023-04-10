import { onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'
import { DailyGratitude } from '@strive/model'
import { enumWorkerType, ScheduledTaskUserExerciseDailyGratitude } from '../../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { updateAggregation } from '../../../shared/aggregation/aggregation'

export const dailyGratitudeCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/DailyGratitude`, 'dailyGratitudeCreatedHandler',
async (snapshot, context) => {

  const uid = context.params.uid
  const dailyGratitudeSettings = snapshot.data() as DailyGratitude
  if (!dailyGratitudeSettings?.on) return

  // aggregation
  updateAggregation({ usersGratitudeOn: 1 })

  scheduleScheduledTask(uid, dailyGratitudeSettings)
})

export const dailyGratitudeChangedHandler = onDocumentUpdate(`Users/{uid}/Exercises/DailyGratitude`, 'dailyGratitudeChangedHandler',
async (snapshot, context) => {

  const uid = context.params.uid
  const before = snapshot.before.data() as DailyGratitude
  const after = snapshot.after.data() as DailyGratitude

  if (before.on !== after.on) {
    updateAggregation({ usersGratitudeOn: after.on ? 1 : -1 })

    if (after.on) {
      //  create task
      scheduleScheduledTask(uid, after)
    } else {
      // delete task
      deleteScheduledTask(`${uid}dailygratitude`)
    }
  } else if (before.time !== after.time) {
    scheduleScheduledTask(uid, after)
  }
})

export const dailyGratitudeDeleteHandler = onDocumentDelete(`Users/{uid}/Exercises/DailyGratitude`, 'dailyGratitudeDeleteHandler',
async (snapshot, context) => {

  const { uid } = context.params

  deleteScheduledTask(`${uid}dailygratitude`)

  updateAggregation({ usersGratitudeOn: -1 })

})

async function scheduleScheduledTask(userId: string, setting: DailyGratitude) {


    const task: Partial<ScheduledTaskUserExerciseDailyGratitude> = {
      worker: enumWorkerType.userExerciseDailyGratitudeReminder,
      performAt: setting.time,
      options: { userId }
    }

    return upsertScheduledTask(`${userId}dailygratitude`, task)
}