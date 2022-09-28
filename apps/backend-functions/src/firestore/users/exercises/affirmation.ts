import { onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '../../../internals/firebase';
import { deleteScheduledTask, upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType, ScheduledTaskUserExerciseAffirmations } from '../../../shared/scheduled-task/scheduled-task.interface'
import { Affirmations } from '@strive/model'
import { scheduleNextAffirmation, getNextAffirmationDate } from '../../../pubsub/user-exercises/affirmations'
import { updateAggregation } from '../../../shared/aggregation/aggregation';

export const affirmationsCreatedHandler = onDocumentCreate(`Users/{userId}/Exercises/Affirmations`, 'affirmationsCreatedHandler',
async (snapshot, context) => {

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

  updateAggregation({ usersAffirmationsSet: affirmations.affirmations.length }) 
})


export const affirmationsChangeHandler = onDocumentUpdate(`Users/{userId}/Exercises/Affirmations`, 'affirmationsChangeHandler',
async (snapshot, context) => {

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

  const delta = after.affirmations.length - before.affirmations.length
  updateAggregation({ usersAffirmationsSet: delta })
})

export const affirmationsDeleteHandler = onDocumentDelete(`Users/{uid}/Exercises/Affirmations`, 'affirmationsDeleteHandler',
async (snapshot, context) => {

  const { uid } = context.params
  const setting = snapshot.data() as Affirmations

  deleteScheduledTask(`${uid}affirmations`)

  updateAggregation({ usersAffirmationsSet: 0 - setting.affirmations.length })
})
