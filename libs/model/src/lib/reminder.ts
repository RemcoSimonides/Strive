export type ReminderInterval = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'never'
export type DayTypes = 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday'

export interface Reminder {
  id: string
  description: string
  isRepeating: boolean | null
  interval: ReminderInterval
  date: Date
  dayOfWeek?: DayTypes
  numberOfWeek: number
  updatedBy?: string
  updatedAt?: Date
  createdAt?: Date
}

/** A factory function that creates a MilestoneDocument. */
export function createReminder(params: Partial<Reminder> = {}): Reminder {
  const reminder: Reminder = {
    id: params.id ?? '',
    description: params.description ?? '',
    isRepeating: params.isRepeating ?? null,
    date: params.date ? new Date(params.date) : new Date(),
    interval: params.interval ?? 'weekly',
    numberOfWeek: params.numberOfWeek ?? 0,
  }

  if (params.dayOfWeek) reminder.dayOfWeek = params.dayOfWeek
  if (params.updatedBy) reminder.updatedBy = params.updatedBy
  if (params.updatedAt) reminder.updatedAt = params.updatedAt
  if (params.createdAt) reminder.createdAt = params.createdAt

  return reminder
}
