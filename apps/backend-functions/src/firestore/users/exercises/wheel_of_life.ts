import { WheelOfLifeSettings } from '@strive/model'
import { logger, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from 'apps/backend-functions/src/internals/firebase'
import { deleteScheduledTask, upsertScheduledTask } from 'apps/backend-functions/src/shared/scheduled-task/scheduled-task'
import { enumWorkerType, ScheduledTaskUserExerciseWheelOfLife } from 'apps/backend-functions/src/shared/scheduled-task/scheduled-task.interface'
import { addMonths, addQuarters, addWeeks, addYears } from 'date-fns'


export const wheelOfLifeCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/{WheelOfLife}`, 'wheelOfLifeCreatedHandler',
async (snapshot, context) => {

  const { uid } = context.params
  const wheelOfLifeSettings = snapshot.data() as WheelOfLifeSettings

  if (wheelOfLifeSettings.interval === 'never') return

  scheduleScheduledTask(uid, wheelOfLifeSettings)
})

export const wheelOfLifeChangedHandler = onDocumentUpdate(`Users/{uid}/Exercises/{WheelOfLife}`, 'wheelOfLifeChangedHandler',
async (snapshot, context) => {

  const { uid } = context.params
  const before = snapshot.before.data() as WheelOfLifeSettings
  const after = snapshot.after.data() as WheelOfLifeSettings

  if (before.interval === after.interval) return

  if (after.interval === 'never') {
    deleteScheduledTask(`${uid}wheeloflife`)
    return
  }

  scheduleScheduledTask(uid, after)
})

export const wheelOfLifeDeleteHandler = onDocumentDelete(`Users/{uid}/Exercises/{WheelOfLife}`, 'wheelOfLifeDeleteHandler',
async (snapshot, context) => {

  const { uid } = context.params

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