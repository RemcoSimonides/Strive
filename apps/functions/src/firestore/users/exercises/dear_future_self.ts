import { onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'
import { createDearFutureSelf, DearFutureSelf, Message } from '@strive/model'

import { enumWorkerType, ScheduledTaskUserExerciseDearFutureSelfMessage } from '../../../shared/scheduled-task/scheduled-task.interface'
import { deleteScheduledTask, upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { updateAggregation } from '../../../shared/aggregation/aggregation'
import { toDate } from '../../../shared/utils'

export const dearFutureSelfCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/DearFutureSelf`,
async (snapshot) => {

  const uid = snapshot.params.uid
  const setting = createDearFutureSelf(toDate<DearFutureSelf>(snapshot.data.data()))
  if (!setting.messages?.length) return

  updateAggregation({ usersFutureLetterSent: setting.messages.length })

  return Promise.all(setting.messages.map(message => scheduleMessage(uid, message)))
})

export const dearFutureSelfChangedHandler = onDocumentUpdate(`Users/{uid}/Exercises/DearFutureSelf`,
async (snapshot) => {

  const uid = snapshot.params.uid
  const before = createDearFutureSelf(toDate<DearFutureSelf>(snapshot.data.before.data()))
  const after = createDearFutureSelf(toDate<DearFutureSelf>(snapshot.data.after.data()))

  updateAggregation({ usersFutureLetterSent: after.messages.length - before.messages.length })

  // Messages are matched on createdAt, not on their place in the list: a write that replaces
  // the list instead of adding to it shifts every index after the change.
  const beforeKeys = new Set(before.messages.map(messageKey))
  const afterKeys = new Set(after.messages.map(messageKey))
  const added = after.messages.filter(message => !beforeKeys.has(messageKey(message)))
  const removed = before.messages.filter(message => !afterKeys.has(messageKey(message)))

  return Promise.all([
    ...added.map(message => scheduleMessage(uid, message)),
    ...removed.map(message => deleteScheduledTask(taskId(uid, message)))
  ])
})

export const dearFutureSelfDeleteHandler = onDocumentDelete(`Users/{uid}/Exercises/DearFutureSelf`,
async (snapshot) => {

  const setting = createDearFutureSelf(toDate<DearFutureSelf>(snapshot.data.data()))
  const { uid } = snapshot.params

  setting.messages.forEach((message, index) => {
    deleteScheduledTask(taskId(uid, message))
    deleteScheduledTask(`${uid}dearfutureself${index}`) // tasks scheduled before messages were keyed on createdAt
  })

  updateAggregation({ usersFutureLetterSent: 0 - setting.messages.length })
})

/** A message's identity is when it was written; the app links to one the same way (goals?dfs=<time>). */
export function messageKey(message: Message): number {
  return message.createdAt.getTime()
}

function taskId(userId: string, message: Message) {
  return `${userId}dearfutureself-${messageKey(message)}`
}

async function scheduleMessage(userId: string, message: Message) {
  const task: Partial<ScheduledTaskUserExerciseDearFutureSelfMessage> = {
    worker: enumWorkerType.userExerciseDearFutureSelfMessage,
    performAt: message.deliveryDate,
    options: { userId, createdAt: messageKey(message) }
  }

  return upsertScheduledTask(taskId(userId, message), task)
}
