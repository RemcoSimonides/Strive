import { arrayUnion, db, onDocumentCreate, onDocumentUpdate } from '@strive/api/firebase'
import { SelfReflectEntry, SelfReflectFrequency, SelfReflectSettings, Message, Personal, Stakeholder, createSelfReflectEntry, createSelfReflectSettings, createDearFutureSelf, createMessage, getFrequency } from '@strive/model'
import { getDocument, getDocumentSnap, toDate, unique } from '../../../shared/utils'
import { addDays, addMonths, addQuarters, addWeeks, addYears, differenceInDays, formatISO, isBefore, isEqual, startOfDay, startOfMonth, startOfQuarter, startOfWeek } from 'date-fns'
import { getNextDay, getNextNextDay, startOfSelfReflectYear } from '@strive/exercises/self-reflect/utils/date.utils'
import { deleteScheduledTask, upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { ScheduledTaskUserExerciseSelfReflect, enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { AES, enc } from 'crypto-js'

export const selfReflectSettingsCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/SelfReflect`, 'selfReflectSettingsCreatedHandler',
async (snapshot, context) => {

  const { uid } = context.params as { uid: string }
  const settings = createSelfReflectSettings(toDate({ ...snapshot.data(), id: snapshot.id }))

  if (settings.preferredDay === 'never') return

  return upsertReminder(uid, settings)
})

export const selfReflectSettingsChangeHandler = onDocumentUpdate(`Users/{uid}/Exercises/SelfReflect`, 'selfReflectChangeHandler',
async (snapshot, context) => {

  const { uid } = context.params as { uid: string }
  const before = createSelfReflectSettings(toDate({ ...snapshot.before.data(), id: snapshot.id }))
  const after = createSelfReflectSettings(toDate({ ...snapshot.after.data(), id: snapshot.id }))

  const preferredDayChanged = before.preferredDay !== after.preferredDay
  const preferredTimeChanged = before.preferredTime !== after.preferredTime

  if (preferredDayChanged && after.preferredDay === 'never') {
    return deleteScheduledTask(`${uid}selfreflect`)
  }

  if (preferredDayChanged || preferredTimeChanged) {
    return upsertReminder(uid, after)
  }

  const beforeAvailableFrequencies = getAvailableFrequencies(before)
  const afterAvailableFrequencies = getAvailableFrequencies(after)

  if (beforeAvailableFrequencies.length && !afterAvailableFrequencies.length) {
    return deleteScheduledTask(`${uid}selfreflect`)
  }

  // if any frequencies have been added or if any frequencies have been removed, update the reminder
  const addedFrequencies = afterAvailableFrequencies.filter(frequency => !beforeAvailableFrequencies.includes(frequency))
  const removedFrequencies = beforeAvailableFrequencies.filter(frequency => !afterAvailableFrequencies.includes(frequency))
  if (addedFrequencies.length || removedFrequencies.length) {
    return upsertReminder(uid, after)
  }
})

export const selfReflectEntryCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/SelfReflect/Entries/{entryId}`, 'selfReflectCreatedHandler',
async (snapshot, context) => {

  const { uid } = context.params as { uid: string }
  const entry = createSelfReflectEntry(toDate({ ...snapshot.data(), id: snapshot.id }))

  const promises = Promise.all([
    saveGratitude(uid, entry),
    saveWheelOfLife(uid, entry),
    saveDearFutureSelf(uid, entry),
    saveImagine(uid, entry),
    savePriorities(uid, entry)
  ])

  return promises
})

export const selfReflectEntryChangeHandler = onDocumentUpdate(`Users/{uid}/Exercises/SelfReflect/Entries/{entryId}`, 'selfReflectChangeHandler',
async (snapshot, context) => {

  const { uid } = context.params as { uid: string }
  const after = createSelfReflectEntry(toDate({ ...snapshot.after.data(), id: snapshot.id }))

  const promises = Promise.all([
    // saveGratitude(uid, after)  // unable to update gratitudes as I don't know which gratitude has been updated and just adding them isn't the solution
    saveWheelOfLife(uid, after), // wheel of life can be overwritten everytime
    // saveDearFutureSelf(uid, after), // unable to update dear future self as I don't know which message has been updated and just adding them isn't the solution
    // saveImagine(uid, after) // unable to update imagine as I don't know which message has been updated and just adding them isn't the solution
    savePriorities(uid, after)
  ])

  return promises
})

async function savePriorities(uid: string, entry: SelfReflectEntry) {
  const { prioritizeGoals } = entry
  if (!prioritizeGoals || !prioritizeGoals.length) return

  const promises = prioritizeGoals.map(goalId => getDocument<Stakeholder>(`Goals/${goalId}/GStakeholders/${uid}`))
  const stakeholders = await Promise.all(promises)

  return stakeholders.map((stakeholder, priority) => {
    return db.doc(`Goals/${stakeholder.goalId}/GStakeholders/${uid}`).update({ priority })
  })
}

async function saveGratitude(uid: string, entry: SelfReflectEntry) {
  if (!entry.gratitude || !entry.gratitude.length) return
  const items = entry.gratitude.slice(0, 3)
  const date = formatISO(new Date(), { representation: 'date' })
  const snap = await getDocumentSnap(`Users/${uid}/Exercises/DailyGratitude/Entries/${date}`)
  if (!snap.exists) return snap.ref.set({ items, creeatedAt: entry.createdAt, updatedAt: entry.updatedAt, id: date })
}

async function saveWheelOfLife(uid: string, entry: SelfReflectEntry) {
  if (!entry.wheelOfLife) return
  if (Object.values(entry.wheelOfLife).every(val => val === '')) return

  const date = formatISO(new Date(), { representation: 'date' })
  const ref = db.doc(`Users/${uid}/Exercises/WheelOfLife/Entries/${date}`)
  return ref.set({ ...entry.wheelOfLife, createdAt: entry.createdAt, updatedAt: entry.updatedAt })
}

async function saveDearFutureSelf(uid: string, entry: SelfReflectEntry) {
  if (!entry.dearFutureSelfAdvice && !entry.dearFutureSelfPrediction) return

  const personal = await getDocument<Personal>(`Users/${uid}/Personal/${uid}`)
  if (!personal) return

  const deliveryDate = entry.frequency === 'daily' ? addDays(entry.createdAt, 1)
    : entry.frequency === 'weekly' ? addWeeks(entry.createdAt, 1)
    : entry.frequency === 'monthly' ? addMonths(entry.createdAt, 1)
    : entry.frequency === 'quarterly' ? addQuarters(entry.createdAt, 1)
    : addYears(entry.createdAt, 1)

  const frequency = getFrequency(entry.frequency)

  let description = ''
  if (entry.dearFutureSelfAdvice) {
    const decrypted = AES.decrypt(entry.dearFutureSelfAdvice, personal.key).toString(enc.Utf8)
    description += `<b>What advice would you give yourself in one ${frequency}?</b><br/><br/>${decrypted}`
  }
  if (entry.dearFutureSelfPrediction) {
    if (description) description += '<br/><br/>'
    const decrypted = AES.decrypt(entry.dearFutureSelfPrediction, personal.key).toString(enc.Utf8)
    description += `<b>What predictions would you make what will happen upcoming ${frequency}?</b><br/><br/>${decrypted}`
  }

  const encryptedDescription = AES.encrypt(description, personal.key).toString()

  const message = createMessage({
    description: encryptedDescription,
    deliveryDate,
    createdAt: entry.createdAt
  })

  addDearFutureSelfMessage(uid, message)
}

async function saveImagine(uid: string, entry: SelfReflectEntry) {
  if (!entry.imagineDie && !entry.imagineFuture) return

  const personal = await getDocument<Personal>(`Users/${uid}/Personal/${uid}`)
  if (!personal) return

  const deliveryDate = addYears(entry.createdAt, 5)

  let description = ''
  if (entry.imagineFuture) {
    const decrypted = AES.decrypt(entry.imagineFuture, personal.key).toString(enc.Utf8)
    description += `<b>Imagine yourself 5 years in the future. What would your life look like?</b><br/><br/>${decrypted}`
  }
  if (entry.imagineDie) {
    if (description) description += '<br/><br/>'
    const decrypted = AES.decrypt(entry.imagineDie, personal.key).toString(enc.Utf8)
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

export async function upsertReminder(uid: string, settings: SelfReflectSettings) {
  const { performAt, performFrequencies } = await getNextReminder(settings, uid)

  const id = `${uid}selfreflect`
  const task: ScheduledTaskUserExerciseSelfReflect = {
    worker: enumWorkerType.userExerciseSelfReflect,
    performAt,
    options: { userId: uid, frequencies: performFrequencies },
    status: 'scheduled'
  }

  return upsertScheduledTask(id, task)
}

export async function getNextReminder(settings: SelfReflectSettings, uid: string) {
  if (settings.preferredDay === 'never') throw new Error('Should not set reminders if preferred day is never')

  const ref = db.collection(`Users/${uid}/Exercises/SelfReflect/Entries`)
  const getLastEntry = async (frequency: SelfReflectFrequency) => {
    const snap = await ref.where('frequency', '==', frequency).orderBy('createdAt', 'desc').limit(1).get()
    if (snap.empty) return undefined
    return createSelfReflectEntry(toDate(snap.docs[0].data()))
  }

  const [daily, weekly, monthly, quarterly, yearly] = await Promise.all([
    getLastEntry('daily'),
    getLastEntry('weekly'),
    getLastEntry('monthly'),
    getLastEntry('quarterly'),
    getLastEntry('yearly')
  ])

  const frequencies = getAvailableFrequencies(settings)
  const now = new Date()

  const startOfNextFrequency = {
    daily: (date: Date) => startOfDay(addDays(date, 1)),
    weekly: (date: Date) => startOfWeek(addWeeks(date, 1)),
    monthly: (date: Date) => startOfMonth(addMonths(date, 1)),
    quarterly: (date: Date) => startOfQuarter(addQuarters(date, 1)),
    yearly: (date: Date) => startOfSelfReflectYear(addYears(date, 1), 12, 24)
  }

  const startOfNextNextFrequency = {
    daily: (date: Date) => startOfDay(addDays(date, 2)),
    weekly: (date: Date) => startOfWeek(addWeeks(date, 2)),
    monthly: (date: Date) => startOfMonth(addMonths(date, 2)),
    quarterly: (date: Date) => startOfQuarter(addQuarters(date, 2)),
    yearly: (date: Date) => startOfSelfReflectYear(addYears(date, 2), 12, 24)
  }

  const minDays = {
    daily: 0, // last day
    weekly: 3, // last three days
    monthly: 21, // last three weeks
    quarterly: 60, // last two months
    yearly: 240 // last 8 months
  }

  let performAt: Date | undefined = undefined
  let performFrequencies: SelfReflectFrequency[] = []

  for (const frequency of frequencies) {
    const start = startOfNextFrequency[frequency](now)
    const next = getNextDay(start, settings.preferredDay, frequency)

    // do not send reminder if the next reminder is too soon - and thus try to set next next reminder
    const lastEntry = frequency === 'daily' ? daily
      : frequency === 'weekly' ? weekly
      : frequency === 'monthly' ? monthly
      : frequency === 'quarterly' ? quarterly
      : yearly

    if (!lastEntry || differenceInDays(next, lastEntry.createdAt) > minDays[frequency]) {

      if (!performAt || isBefore(next, performAt)) {
        performAt = next
        performFrequencies = [frequency]
      } else if (isEqual(next, performAt)) {
        performFrequencies.push(frequency)
      }

    } else {
      const startNextNext = startOfNextNextFrequency[frequency](now)
      const nextNext = getNextNextDay(startNextNext, settings.preferredDay)

      if (!performAt || isBefore(nextNext, performAt)) {
        performAt = nextNext
        performFrequencies = [frequency]
      } else if (isEqual(nextNext, performAt)) {
        performFrequencies.push(frequency)
      }
    }
  }

  if (!performAt) throw new Error('No performAt found')

  const [hours, minutes] = settings.preferredTime.split(':').map(str => parseInt(str))
  performAt.setHours(hours)
  performAt.setMinutes(minutes)

  return { performAt, performFrequencies }
}

function getAvailableFrequencies(settings: SelfReflectSettings) {
  const frequencies = settings.questions.map(({ frequency }) => frequency)
  const availableFrequencies = frequencies.filter(frequency => frequency !== 'never') as SelfReflectFrequency[]
  const order: SelfReflectFrequency[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  const orderedFrequencies = availableFrequencies.sort((a, b) => order.indexOf(a) - order.indexOf(b))
  return unique(orderedFrequencies)
}
