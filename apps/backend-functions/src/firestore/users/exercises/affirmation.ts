import { functions } from '../../../internals/firebase';
import { upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType, IScheduledTaskUserExerciseAffirmations } from '../../../shared/scheduled-task/scheduled-task.interface'
import { IAffirmations } from '@strive/interfaces';
import { scheduleNextAffirmation, getNextAffirmationDate } from '../../../pubsub/user-exercises/affirmations'

export const affirmationsCreatedHandler = functions.firestore.document(`Users/{userId}/Exercises/Affirmations`)
    .onCreate(async (snapshot, context) => {

        const uid = context.params.userId
        const affirmations: IAffirmations = Object.assign(<IAffirmations>{}, snapshot.data())
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


        const before: IAffirmations = Object.assign(<IAffirmations>{}, snapshot.before.data())
        const after: IAffirmations = Object.assign(<IAffirmations>{}, snapshot.after.data())
        const uid = context.params.userId

        if (before.times !== after.times) {

            await scheduleNextAffirmation(uid, after)

        }

    })
