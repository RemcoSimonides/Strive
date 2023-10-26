import { arrayUnion, db, logger, onDocumentCreate, onDocumentUpdate } from '@strive/api/firebase'
import { AssessLifeEntry, AssessLifeInterval, AssessLifeSettings, Message, Personal, createAssessLifeEntry, createAssessLifeSettings, createDearFutureSelf, createMessage, getInterval } from '@strive/model'
import { getDocument, getDocumentSnap, toDate, unique } from '../../../shared/utils'
import { addMonths, addQuarters, addWeeks, addYears, differenceInDays, formatISO, isBefore, isEqual, startOfMonth, startOfQuarter, startOfWeek } from 'date-fns'
import { getNextDay, startOfAssessLifeYear } from '@strive/exercises/assess-life/utils/date.utils'
import { deleteScheduledTask, upsertScheduledTask } from 'apps/backend-functions/src/shared/scheduled-task/scheduled-task'
import { ScheduledTaskUserExerciseAssessLife, enumWorkerType } from 'apps/backend-functions/src/shared/scheduled-task/scheduled-task.interface'
import { AES, enc } from 'crypto-js'

export const assessLifeSettingsCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/AssessLife`, 'assessLifeSettingsCreatedHandler',
async (snapshot, context) => {

  const { uid } = context.params as { uid: string }
  const settings = createAssessLifeSettings(toDate({ ...snapshot.data(), id: snapshot.id }))

  if (settings.preferredDay === 'never') return

  return upsertReminder(uid, settings)
})

export const assessLifeSettingsChangeHandler = onDocumentUpdate(`Users/{uid}/Exercises/AssessLife`, 'assessLifeChangeHandler',
async (snapshot, context) => {

  logger.log('changed assess life settings')

  const { uid } = context.params as { uid: string }
  const before = createAssessLifeSettings(toDate({ ...snapshot.before.data(), id: snapshot.id }))
  const after = createAssessLifeSettings(toDate({ ...snapshot.after.data(), id: snapshot.id }))

  const preferredDayChanged = before.preferredDay !== after.preferredDay
  const preferredTimeChanged = before.preferredTime !== after.preferredTime

  if (preferredDayChanged && after.preferredDay === 'never') {
    return deleteScheduledTask(`${uid}assesslife`)
  }

  if (preferredDayChanged || preferredTimeChanged) {
    return upsertReminder(uid, after)
  }

  const beforeAvailableIntervals = getAvailableIntervals(before)
  const afterAvailableIntervals = getAvailableIntervals(after)

  if (beforeAvailableIntervals.length && !afterAvailableIntervals.length) {
    return deleteScheduledTask(`${uid}assesslife`)
  }

  // if any intervals have been added or if any intervals have been removed, update the reminder
  const addedIntervals = afterAvailableIntervals.filter(interval => !beforeAvailableIntervals.includes(interval))
  const removedIntervals = beforeAvailableIntervals.filter(interval => !afterAvailableIntervals.includes(interval))
  if (addedIntervals.length || removedIntervals.length) {
    return upsertReminder(uid, after)
  }
})

export const assessLifeEntryCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/AssessLife/Entries/{entryId}`, 'abcdef',
async (snapshot, context) => {

  const { uid } = context.params as { uid: string }
  const entry = createAssessLifeEntry(toDate({ ...snapshot.data(), id: snapshot.id }))

  const promises = Promise.all([
    saveGratitude(uid, entry),
    saveWheelOfLife(uid, entry),
    saveDearFutureSelf(uid, entry),
    saveImagine(uid, entry)
  ])

  return promises

  // TODO Sync goal priorities after submitting. And keep the goal priorities in the entry to see what the history was.
})

export const assessLifeEntryChangeHandler = onDocumentCreate(`Users/{uid}/Exercises/AssessLife/Entries/{entryId}`, 'assessLifeChangeHandler',
async (snapshot, context) => {

  const { uid } = context.params as { uid: string }
  const after = createAssessLifeEntry(toDate({ ...snapshot.after.data(), id: snapshot.id }))

  const promises = Promise.all([
    // saveGratitude(uid, after)  // unable to update gratitudes as I don't know which gratitude has been updated and just adding them isn't the solution
    saveWheelOfLife(uid, after), // wheel of life can be overwritten everytime
    // saveDearFutureSelf(uid, after), // unable to update dear future self as I don't know which message has been updated and just adding them isn't the solution
    // saveImagine(uid, after) // unable to update imagine as I don't know which message has been updated and just adding them isn't the solution
  ])

  return promises
})

async function saveGratitude(uid: string, entry: AssessLifeEntry) {
  const items = entry.gratitude.entries.slice(0, 3)
  if (!items.length) return

  const date = formatISO(new Date(), { representation: 'date' })
  const snap = await getDocumentSnap(`Users/${uid}/Exercises/DailyGratitude/Entries/${date}`)
  if (!snap.exists) return snap.ref.set({ items, creeatedAt: entry.createdAt, updatedAt: entry.updatedAt, id: date })
}

async function saveWheelOfLife(uid: string, entry: AssessLifeEntry) {
  if (Object.values(entry.wheelOfLife).every(val => val === '')) return

  const date = formatISO(new Date(), { representation: 'date' })
  const ref = db.doc(`Users/${uid}/Exercises/WheelOfLife/Entries/${date}`)
  return ref.set({ ...entry.wheelOfLife, createdAt: entry.createdAt, updatedAt: entry.updatedAt })
}

async function saveDearFutureSelf(uid: string, entry: AssessLifeEntry) {
  if (Object.values(entry.dearFutureSelf).every(val => val === '')) return

  const personal = await getDocument<Personal>(`Users/${uid}/Personal/${uid}`)
  if (!personal) return

  const deliveryDate = entry.interval === 'weekly' ? addWeeks(entry.createdAt, 1)
    : entry.interval === 'monthly' ? addMonths(entry.createdAt, 1)
    : entry.interval === 'quarterly' ? addQuarters(entry.createdAt, 1)
    : addYears(entry.createdAt, 1)

  const { advice, predictions, anythingElse } = entry.dearFutureSelf
  const interval = getInterval(entry.interval)

  let description = ''
  if (advice) {
    const decrypted = AES.decrypt(advice, personal.key).toString(enc.Utf8)
    description += `<b>What advice would you give yourself in one ${interval}?</b><br/><br/>${decrypted}`
  }
  if (predictions) {
    if (description) description += '<br/><br/>'
    const decrypted = AES.decrypt(predictions, personal.key).toString(enc.Utf8)
    description += `<b>What predictions would you make what will happen upcoming ${interval}?</b><br/><br/>${decrypted}`
  }
  if (anythingElse) {
    if (description) description += '<br/><br/>'
    const decrypted = AES.decrypt(anythingElse, personal.key).toString(enc.Utf8)
    description += `<b>Anything else you would like to mention?</b><br/><br/>${decrypted}`
  }

  const encryptedDescription = AES.encrypt(description, personal.key).toString()

  const message = createMessage({
    description: encryptedDescription,
    deliveryDate,
    createdAt: entry.createdAt
  })

  addDearFutureSelfMessage(uid, message)
}

async function saveImagine(uid: string, entry: AssessLifeEntry) {
  if (Object.values(entry.imagine).every(val => val === '')) return

  const personal = await getDocument<Personal>(`Users/${uid}/Personal/${uid}`)
  if (!personal) return

  const deliveryDate = addYears(entry.createdAt, 5)

  const { die, future } = entry.imagine
  let description = ''
  if (future) {
    const decrypted = AES.decrypt(future, personal.key).toString(enc.Utf8)
    description += `<b>Imagine yourself 5 years in the future. What would your life look like?</b><br/><br/>${decrypted}`
  }
  if (die) {
    if (description) description += '<br/><br/>'
    const decrypted = AES.decrypt(die, personal.key).toString(enc.Utf8)
    description += `<b>What would you do in the next 5 years if you were to die right after those years?</b><br/><br/>${decrypted}`
  }

  const encryptedDescription = AES.encrypt(description, personal.key).toString()

  const message = createMessage({
    description: encryptedDescription,
    deliveryDate,
    createdAt: entry.createdAt
  })

  addDearFutureSelfMessage(uid, message)
}

async function addDearFutureSelfMessage(uid: string, message: Message) {
  const snap = await getDocumentSnap(`Users/${uid}/Exercises/DearFutureSelf`)
  if (snap.exists) {
    await snap.ref.update({
      messages: arrayUnion(message)
    })
  } else {
    const dfs = createDearFutureSelf({ id: 'DearFutureSelf', messages: [message], createdAt: message.createdAt, updatedAt: message.createdAt })
    await snap.ref.set(dfs)
  }
}

export function upsertReminder(uid: string, settings: AssessLifeSettings) {
  const { performAt, performIntervals } = getNextReminder(settings)

  const id = `${uid}assesslife`
  const task: ScheduledTaskUserExerciseAssessLife = {
    worker: enumWorkerType.userExerciseAssessLife,
    performAt,
    options: { userId: uid, intervals: performIntervals },
    status: 'scheduled'
  }

  return upsertScheduledTask(id, task)
}

export function getNextReminder(settings: AssessLifeSettings) {
  if (settings.preferredDay === 'never') throw new Error('Should not set reminders if preferred day is never')

  const intervals = getAvailableIntervals(settings)
  const now = settings.createdAt

  const startOfNextInterval = {
    weekly: (date: Date) => startOfWeek(addWeeks(date, 1)),
    monthly: (date: Date) => startOfMonth(addMonths(date, 1)),
    quarterly: (date: Date) => startOfQuarter(addQuarters(date, 1)),
    yearly: (date: Date) => startOfAssessLifeYear(addYears(date, 1), 12, 24)
  }

  const startOfNextNextInterval = {
    weekly: (date: Date) => startOfWeek(addWeeks(date, 2)),
    monthly: (date: Date) => startOfMonth(addMonths(date, 2)),
    quarterly: (date: Date) => startOfQuarter(addQuarters(date, 2)),
    yearly: (date: Date) => startOfAssessLifeYear(addYears(date, 2), 12, 24)
  }

  const minDays = {
    weekly: 3, // last three days
    monthly: 21, // last three weeks
    quarterly: 60, // last two months
    yearly: 240 // last 8 months
  }

  let performAt: Date | undefined = undefined
  let performIntervals: AssessLifeInterval[] = []

  for (const interval of intervals) {
    const start = startOfNextInterval[interval](now)
    const next = getNextDay(start, settings.preferredDay)

    // do not send reminder if the next reminder is too soon - and thus try to set next next reminder
    const difference = differenceInDays(next, now)
    if (difference > minDays[interval]) {

      if (!performAt || isBefore(next, performAt)) {
        performAt = next
        performIntervals = [interval]
      } else if (isEqual(next, performAt)) {
        performIntervals.push(interval)
      }

    } else {
      const startNextNext = startOfNextNextInterval[interval](now)
      const nextNext = getNextDay(startNextNext, settings.preferredDay)

      if (!performAt || isBefore(nextNext, performAt)) {
        performAt = nextNext
        performIntervals = [interval]
      } else if (isEqual(nextNext, performAt)) {
        performIntervals.push(interval)
      }
    }
  }

  if (!performAt) throw new Error('No performAt found')

  const [hours, minutes] = settings.preferredTime.split(':').map(str => parseInt(str))
  performAt.setHours(hours)
  performAt.setMinutes(minutes)

  return { performAt, performIntervals }
}

function getAvailableIntervals(settings: AssessLifeSettings) {
  const availableIntervals = ['weekly', 'monthly', 'quarterly', 'yearly']
  return unique(Object.values(settings).filter(interval => availableIntervals.includes(interval))) as AssessLifeInterval[]
}
