import { SelfReflectFrequency, Weekday } from '@strive/model'
import { Day, addDays, getDay, getMonth, getQuarter, getWeek, getYear, isBefore, nextDay, startOfDay, startOfMonth, startOfQuarter, startOfWeek, startOfYear } from 'date-fns'

const weekdayMapping: Record<Weekday, Day> = {
  'sunday': 0,
  'monday': 1,
  'tuesday': 2,
  'wednesday': 3,
  'thursday': 4,
  'friday': 5,
  'saturday': 6
}

export function getNextDay(startNextFrequency: Date, weekday: Weekday, frequency: SelfReflectFrequency) {
  const startMethods = {
    'daily': startOfDay,
    'weekly': startOfWeek,
    'monthly': startOfMonth,
    'quarterly': startOfQuarter,
    'yearly': startOfYear
  }

  const today = startOfDay(new Date())
  const day = weekdayMapping[weekday]

  if (frequency === 'daily') {
    // No need to calculate next day because weekday is irrelevant for daily
    return startNextFrequency
  }

  const startOfFrequencyDate = startMethods[frequency](startNextFrequency)
  const firstWeekdayOfFrequency = nextDay(startOfFrequencyDate, day)
  const before = isBefore(startNextFrequency, firstWeekdayOfFrequency)

  const date = before ? today : startNextFrequency

  const yesterday = addDays(date, -1) // to return today if today is weekday
  return nextDay(yesterday, weekdayMapping[weekday])
}

export function getNextNextDay(date: Date, weekday: Weekday) {
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

export function getSelfReflectId(frequency: SelfReflectFrequency, date?: Date) {
  const today = startOfDay(date ?? new Date())

  const startMethods = {
    'daily': startOfDay,
    'weekly': startOfWeek,
    'monthly': startOfMonth,
    'quarterly': startOfQuarter,
    'yearly': (_date: Date) => startOfSelfReflectYear(_date, 12, 24)
  }

  const start = startMethods[frequency](today)
  const year = getYear(start)
  const quarter = getQuarter(start)
  const month = getMonth(start)
  const week = getWeek(start)
  const day = getDay(start)

  if (frequency === 'daily') {
    return `${year}-${quarter}-${month}-${week}-${day}`
  } else if (frequency === 'weekly') {
    return `${year}-${quarter}-${month}-${week}`
  } else if (frequency === 'monthly') {
    return `${year}-${quarter}-${month}`
  } else if (frequency === 'quarterly') {
    return `${year}-${quarter}`
  } else {
    return `${year}`
  }
}