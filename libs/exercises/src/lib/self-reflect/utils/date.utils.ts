import { SelfReflectInterval, Weekday } from '@strive/model'
import { addDays, getMonth, getQuarter, getWeek, getYear, isBefore, nextDay, startOfDay, startOfMonth, startOfQuarter, startOfWeek } from 'date-fns'

const weekdayMapping: Record<Weekday, Day> = {
  'sunday': 0,
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6
}

export function getNextDay(date: Date, weekday: Weekday) {
  const today = startOfDay(date)
  const yesterday = addDays(today, -1) // to return today if today is weekday
  return nextDay(yesterday, weekdayMapping[weekday])
}

export function getSelfReflectYear(date: Date, startMonth: number, startDay: number) {
  const year = getYear(date)
  const yearStart = new Date(year, startMonth - 1, startDay)

  if (isBefore(date, yearStart)) {
    yearStart.setFullYear(year - 1)
  }

  return getYear(yearStart)
}

export function startOfSelfReflectYear(date: Date, startMonth: number, startDay: number) {
  const year = getYear(date)
  const yearStart = new Date(year, startMonth - 1, startDay)

  if (isBefore(date, yearStart)) {
    yearStart.setFullYear(year - 1);
  }

  return yearStart
}

export function getSelfReflectId(interval: SelfReflectInterval, date?: Date) {
  const today = startOfDay(date ?? new Date())

  const startMethods = {
    'weekly': startOfWeek,
    'monthly': startOfMonth,
    'quarterly': startOfQuarter,
    'yearly': (_date: Date) => startOfSelfReflectYear(_date, 12, 24)
  }

  const start = startMethods[interval](today)
  const year = getYear(start)
  const quarter = getQuarter(start)
  const month = getMonth(start)
  const week = getWeek(start)

  if (interval === 'weekly') {
    return `${year}-${quarter}-${month}-${week}`
  } else if (interval === 'monthly') {
    return `${year}-${quarter}-${month}`
  } else if (interval === 'quarterly') {
    return `${year}-${quarter}`
  } else {
    return `${year}`
  }
}