import { functions } from '../../../internals/firebase';
import { deleteScheduledTask, upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType, ScheduledTaskUserExerciseAffirmations } from '../../../shared/scheduled-task/scheduled-task.interface'
import { Affirmations } from '@strive/exercises/affirmation/+state/affirmation.firestore';
import { scheduleNextAffirmation, getNextAffirmationDate } from '../../../pubsub/user-exercises/affirmations'

export const affirmationsCreatedHandler = functions.firestore.document(`Users/{userId}/Exercises/Affirmations`)
  .onCreate(async (snapshot, context) => {

    const uid = context.params.userId
    const affirmations = snapshot.data() as Affirmations
    if (!affirmations) return
    if (affirmations.times.every(time => time === '')) return

    const nextDate = getNextAffirmationDate(affirmations)
    
    // create scheduled task on set time
    const task: ScheduledTaskUserExerciseAffirmations = {
      worker: enumWorkerType.userExerciseAffirmation,
      performAt: nextDate,
      options: { userId: uid },
      status: 'scheduled'
    }
    upsertScheduledTask(`${uid}affirmations`, task)
  })

export const affirmationsChangeHandler = functions.firestore.document(`Users/{userId}/Exercises/Affirmations`)
  .onUpdate(async (snapshot, context) => {

    const before = snapshot.before.data() as Affirmations
    const after = snapshot.after.data() as Affirmations
    const uid = context.params.userId

    const timesBefore = before.times.filter(time => !!time)
    const timesAfter = after.times.filter(time => !!time)
    const removedAllTimes = timesBefore.length > 0 && timesAfter.length === 0
    const removedAllAffirmations = before.affirmations.length > 0 && after.affirmations.length === 0
    if (removedAllTimes || removedAllAffirmations) {
      deleteScheduledTask(`${uid}affirmations`)
    }

    if (timesAfter.length === 0) return

    if (JSON.stringify(before.times) !== JSON.stringify(after.times)) {
      scheduleNextAffirmation(uid, after)
    }
  })
