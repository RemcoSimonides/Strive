import { logger, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'
import { createReminder, DayTypes, Reminder } from '@strive/model'
import { deleteScheduledTask, upsertScheduledTask } from 'apps/backend-functions/src/shared/scheduled-task/scheduled-task'
import { enumWorkerType, ScheduledTaskGoalReminder } from 'apps/backend-functions/src/shared/scheduled-task/scheduled-task.interface'
import { toDate } from 'apps/backend-functions/src/shared/utils'
import { addDays, addMonths, addWeeks, Day, nextDay, startOfMonth, addQuarters, startOfQuarter, addYears } from 'date-fns'

export const goalReminderCreatedHandler = onDocumentCreate(`Goals/{goalId}/GStakeholders/{stakeholderId}/Reminders/{reminderId}`,
async (snapshot) => {

  const { goalId, stakeholderId, reminderId } = snapshot.params
  const reminder = createReminder(toDate({ ...snapshot.data, id: snapshot.id }))

  await upsertNextReminder(goalId, stakeholderId, reminderId, reminder)

})

export const goalReminderChangeHandler = onDocumentUpdate(`Goals/{goalId}/GStakeholders/{stakeholderId}/Reminders/{reminderId}`,
async (snapshot) => {

  const { goalId, stakeholderId, reminderId } = snapshot.params
  const reminder = createReminder(toDate({ ...snapshot.data.after, id: snapshot.data.after.id }))

  await upsertNextReminder(goalId, stakeholderId, reminderId, reminder)
})

export const goalReminderDeleteHandler = onDocumentDelete(`Goals/{goalId}/GStakeholders/{stakeholderId}/Reminders/{reminderId}`,
async (snapshot) => {

  const { goalId, reminderId } = snapshot.params
  const id = `${goalId}${reminderId}`
  return deleteScheduledTask(id)
})

async function upsertNextReminder(goalId: string, userId: string, reminderId: string, reminder: Reminder) {

  const performAt = nextReminder(reminder)
  logger.log('perform next reminder at ', performAt)
  const id = `${goalId}${reminderId}`
  const task: ScheduledTaskGoalReminder = {
    worker: enumWorkerType.goalReminder,
    performAt,
    options: {
      userId,
      goalId,
      reminderId,
      description: reminder.description
    },
    status: 'scheduled'
  }

  return upsertScheduledTask(id, task)
}

export function nextReminder({ isRepeating, interval, date, numberOfWeek, dayOfWeek }: Reminder) {
  const dayMapper: Record<DayTypes, Day> = {
    'sunday': 0,
    'monday': 1,
    'tuesday': 2,
    'wednesday': 3,
    'thursday': 4,
    'friday': 5,
    'saturday': 6
  }

  const now = new Date()
  const timed = new Date(now.getFullYear(), now.getMonth(), now.getDate(), date.getHours(), date.getMinutes())

  if (isRepeating) {
    switch (interval) {
      case 'yearly': {
        return addYears(date, 1)
      }

      case 'quarterly': {
        const nextQuarter = addQuarters(timed, 1)
        const startQuarter = startOfQuarter(nextQuarter)

        const monthsToAdd = Math.floor(numberOfWeek / 4)
        const weeksToAdd = numberOfWeek % 4

        const addedMonths = addMonths(startQuarter, monthsToAdd)
        const addedWeeks = addWeeks(addedMonths, weeksToAdd)
        return nextDay(addedWeeks, dayMapper[dayOfWeek])
      }

      case 'monthly': {
        const nextMonth = addMonths(timed, 1)
        const startMonth = startOfMonth(nextMonth)
        const addedWeeks = addWeeks(startMonth, numberOfWeek)
        return nextDay(addedWeeks, dayMapper[dayOfWeek])
      }

      case 'weekly': {
        return nextDay(timed, dayMapper[dayOfWeek])
      }

      case 'daily': {
        return addDays(timed, 1)
      }
    }

  } else {
    return date
  }
}