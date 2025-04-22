import { onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'
import { createDailyGratitude, DailyGratitude } from '@strive/model'
import { enumWorkerType, ScheduledTaskUserExerciseDailyGratitude } from '../../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { updateAggregation } from '../../../shared/aggregation/aggregation'

export const dailyGratitudeCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/DailyGratitude`,
async (snapshot) => {

  const uid = snapshot.params.uid
  const dailyGratitudeSettings = createDailyGratitude(snapshot.data.data())
  if (!dailyGratitudeSettings?.on) return

  // aggregation
  updateAggregation({ usersGratitudeOn: 1 })

  scheduleScheduledTask(uid, dailyGratitudeSettings)
})

export const dailyGratitudeChangedHandler = onDocumentUpdate(`Users/{uid}/Exercises/DailyGratitude`,
async (snapshot) => {

  const uid = snapshot.params.uid
  const before = createDailyGratitude(snapshot.data.before.data())
  const after = createDailyGratitude(snapshot.data.after.data())

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

export const dailyGratitudeDeleteHandler = onDocumentDelete(`Users/{uid}/Exercises/DailyGratitude`,
async (snapshot) => {

  const { uid } = snapshot.params

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