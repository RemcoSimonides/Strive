import { functions } from '../../../internals/firebase';
import { upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType, IScheduledTaskUserExerciseAffirmations } from '../../../shared/scheduled-task/scheduled-task.interface'
import { Affirmations } from '@strive/exercises/affirmation/+state/affirmation.firestore';
import { scheduleNextAffirmation, getNextAffirmationDate } from '../../../pubsub/user-exercises/affirmations'

export const affirmationsCreatedHandler = functions.firestore.document(`Users/{userId}/Exercises/Affirmations`)
    .onCreate(async (snapshot, context) => {

        const uid = context.params.userId
        const affirmations: Affirmations = Object.assign(<Affirmations>{}, snapshot.data())
        if (!affirmations) return

        const nextDate = getNextAffirmationDate(affirmations)
        
        // create scheduled task on set time
        const task: IScheduledTaskUserExerciseAffirmations = {
            worker: enumWorkerType.userExerciseAffirmation,
            performAt: nextDate,
            options: {
                userId: uid
            }
        }

        await upsertScheduledTask(`${uid}affirmations`, task)

    })

export const affirmationsChangeHandler = functions.firestore.document(`Users/{userId}/Exercises/Affirmations`)
    .onUpdate(async (snapshot, context) => {


        const before: Affirmations = Object.assign(<Affirmations>{}, snapshot.before.data())
        const after: Affirmations = Object.assign(<Affirmations>{}, snapshot.after.data())
        const uid = context.params.userId

        if (before.times !== after.times) {

            await scheduleNextAffirmation(uid, after)

        }

    })
