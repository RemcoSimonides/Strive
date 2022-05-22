import { functions } from '../../../internals/firebase';
import { DearFutureSelf } from '@strive/exercises/dear-future-self/+state/dear-future-self.firestore';

import { enumWorkerType, ScheduledTaskUserExerciseDearFutureSelfMessage } from '../../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'

export const dearFutureSelfCreatedHandler = functions.firestore.document(`Users/{uid}/Exercises/DearFutureSelf`)
  .onCreate(async (snapshot, context) => {

    const uid = context.params.uid
    const setting = snapshot.data() as DearFutureSelf
    if (!setting.messages?.length) return

    scheduleScheduledTask(uid, setting, 0)
  })

export const dearFutureSelfChangedHandler = functions.firestore.document(`Users/{uid}/Exercises/DearFutureSelf`)
  .onUpdate(async (snapshot, context) => {

    const uid = context.params.uid
    const before = snapshot.before.data() as DearFutureSelf
    const after = snapshot.after.data() as DearFutureSelf

    if (before.messages.length >= after.messages.length) return

    const index = after.messages.length - 1
    scheduleScheduledTask(uid, after, index)
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