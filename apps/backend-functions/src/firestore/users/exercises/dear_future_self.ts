import { onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'
import { createDearFutureSelf, DearFutureSelf } from '@strive/model'

import { enumWorkerType, ScheduledTaskUserExerciseDearFutureSelfMessage } from '../../../shared/scheduled-task/scheduled-task.interface'
import { deleteScheduledTask, upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { updateAggregation } from '../../../shared/aggregation/aggregation'

export const dearFutureSelfCreatedHandler = onDocumentCreate(`Users/{uid}/Exercises/DearFutureSelf`,
async (snapshot) => {

  const uid = snapshot.params.uid
  const setting = createDearFutureSelf(snapshot.data.data())
  if (!setting.messages?.length) return

  updateAggregation({ usersFutureLetterSent: 1 })

  scheduleScheduledTask(uid, setting, 0)
})

export const dearFutureSelfChangedHandler = onDocumentUpdate(`Users/{uid}/Exercises/DearFutureSelf`,
async (snapshot) => {

  const uid = snapshot.params.uid
  const before = createDearFutureSelf(snapshot.data.before.data())
  const after = createDearFutureSelf(snapshot.data.after.data())

  updateAggregation({ usersFutureLetterSent: after.messages.length - before.messages.length })
  if (before.messages.length >= after.messages.length) return

  const index = after.messages.length - 1
  scheduleScheduledTask(uid, after, index)
})

export const dearFutureSelfDeleteHandler = onDocumentDelete(`Users/{uid}/Exercises/DearFutureSelf`,
async (snapshot) => {

  const setting = createDearFutureSelf(snapshot.data.data())
  const { uid } = snapshot.params

  setting.messages.forEach((message, index) => {
    deleteScheduledTask(`${uid}dearfutureself${index}`)
  })

  updateAggregation({ usersFutureLetterSent: 0 - setting.messages.length })
})

async function scheduleScheduledTask(userId: string, setting: DearFutureSelf, index: number) {
  const message = setting.messages[index]
  const task: Partial<ScheduledTaskUserExerciseDearFutureSelfMessage> = {
    worker: enumWorkerType.userExerciseDearFutureSelfMessage,
    performAt: message.deliveryDate,
    options: { userId, index }
  }

  return upsertScheduledTask(`${userId}dearfutureself${index}`, task)
}