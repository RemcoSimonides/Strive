import { functions } from '../../../internals/firebase';
import * as moment from 'moment'
import { DailyGratefulness } from '@strive/exercises/daily-gratefulness/+state/daily-gratefulness.firestore'
import { IScheduledTaskUserExerciseDailyGratefulness, enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask, deleteScheduledTask } from '../../../shared/scheduled-task/scheduled-task'

export const dailyGratefulnessCreatedHandler = functions.firestore.document(`Users/{uid}/Exercises/DailyGratefulness`)
    .onCreate(async (snapshot, context) => {

        const uid = context.params.uid
        const dailyGratefulnessSettings: DailyGratefulness = Object.assign(<DailyGratefulness>{}, snapshot.data())
        if (!dailyGratefulnessSettings) return
        if (!dailyGratefulnessSettings.on) return

        await scheduleScheduledTask(uid, dailyGratefulnessSettings)

    })

export const dailyGratefulnessChangedHandler = functions.firestore.document(`Users/{uid}/Exercises/DailyGratefulness`)
    .onUpdate(async (snapshot, context) => {

        const uid = context.params.uid
        const before: DailyGratefulness = Object.assign(<DailyGratefulness>{}, snapshot.before.data())
        const after: DailyGratefulness = Object.assign(<DailyGratefulness>{}, snapshot.after.data())

        if (before.time !== after.time || before.on !== after.on) {

            if (before.on !== after.on) {
                if (after.on === false) {

                    // delete task
                    await deleteScheduledTask(`${uid}dailygratefulness`)

                } else {

                    //  create task
                    await scheduleScheduledTask(uid, after)
                
                }
            } else if (before.time !== after.time) {
                
                await scheduleScheduledTask(uid, after)
            
            }
        }
    })

async function scheduleScheduledTask(uid: string, dailyGratefulnessSettings: DailyGratefulness): Promise<void> {

    const hours: number = new Date().getHours()

    const setHours: number = +dailyGratefulnessSettings.time.substring(0, dailyGratefulnessSettings.time.indexOf(':'))
    const setMinutes: number = +dailyGratefulnessSettings.time.substring(dailyGratefulnessSettings.time.indexOf(':') + 1)

    let scheduledDate = moment(new Date().setHours(+setHours, +setMinutes)).toISOString()

    // check if set time is today or tomorrow
    if (hours > setHours) {
        // time passed so set date to tomorrow
        scheduledDate = moment(scheduledDate).add(1, 'day').toISOString()
    }

    // create scheduled task
    const task: IScheduledTaskUserExerciseDailyGratefulness = {
        worker: enumWorkerType.userExerciseDailyGratefulnessReminder,
        performAt: scheduledDate,
        options: {
            userId: uid
        }
    }

    await upsertScheduledTask(`${uid}dailygratefulness`, task)


}