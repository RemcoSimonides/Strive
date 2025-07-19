import { createWheelOfLifeSettings, WheelOfLifeSettings } from '@strive/model'
import { logger, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'
import { updateAggregation } from '../../../shared/aggregation/aggregation'
import { deleteScheduledTask, upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType, ScheduledTaskUserExerciseWheelOfLife } from '../../../shared/scheduled-task/scheduled-task.interface'
import { addMonths, addQuarters, addWeeks, addYears } from 'date-fns'


export const wheelOfLifeCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/WheelOfLife`,
async (snapshot) => {

  const { uid } = snapshot.params
  const wheelOfLifeSettings = createWheelOfLifeSettings(snapshot.data.data())

  if (wheelOfLifeSettings.interval === 'never') return

  scheduleScheduledTask(uid, wheelOfLifeSettings)
})

export const wheelOfLifeEntryCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/WheelOfLife/Entries/{entryId}`,
async () => {

  updateAggregation({ usersWheelOfLifeEntryAdded: 1 })

})

export const wheelOfLifeChangedHandler = onDocumentUpdate(`Users/{uid}/Exercises/WheelOfLife`,
async (snapshot) => {

  const { uid } = snapshot.params
  const before = createWheelOfLifeSettings(snapshot.data.before.data())
  const after = createWheelOfLifeSettings(snapshot.data.after.data())

  if (before.interval === after.interval) return

  if (after.interval === 'never') {
    deleteScheduledTask(`${uid}wheeloflife`)
    return
  }

  scheduleScheduledTask(uid, after)
})

export const wheelOfLifeDeleteHandler = onDocumentDelete(`Users/{uid}/Exercises/WheelOfLife`,
async (snapshot) => {

  const { uid } = snapshot.params

  deleteScheduledTask(`${uid}wheeloflife`)
})

async function scheduleScheduledTask(userId: string, setting: WheelOfLifeSettings) {

  const now = new Date().setHours(8)

  let performAt = undefined
  if (setting.interval === 'weekly') performAt = addWeeks(now, 1)
  if (setting.interval === 'monthly') performAt = addMonths(now, 1)
  if (setting.interval === 'quarterly') performAt = addQuarters(now, 1)
  if (setting.interval === 'yearly') performAt = addYears(now, 1)

  logger.log('setting: ', setting)
  logger.log('performAt: ', performAt)

  const task: Partial<ScheduledTaskUserExerciseWheelOfLife> = {
    worker: enumWorkerType.userExerciseWheelOfLifeReminder,
    performAt,
    options: { userId }
  }

  return upsertScheduledTask(`${userId}wheeloflife`, task)
}