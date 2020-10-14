import { db, admin } from '../../internals/firebase';
import * as moment from 'moment'
import { IAffirmations } from '@strive/interfaces';
import { Profile } from '@strive/user/user/+state/user.firestore';
import { IScheduledTaskUserExerciseAffirmations, enumWorkerType, enumTaskStatus } from '../../shared/scheduled-task/scheduled-task.interface'
import { upsertScheduledTask } from '../../shared/scheduled-task/scheduled-task'

export async function sendAffirmationPushNotification(uid: string, affirmations: IAffirmations): Promise<void> {

    if  (affirmations.affirmations.length >= 1) {

        const randomAffirmation = affirmations.affirmations[Math.floor(Math.random() * affirmations.affirmations.length)];

        // get profile for FCM tokens
        const profileDocRef: admin.firestore.DocumentReference = db.doc(`Users/${uid}/Profile/${uid}`)
        const profileDocSnap: admin.firestore.DocumentSnapshot = await profileDocRef.get()
        const profile: Profile = Object.assign(<Profile>{}, profileDocSnap.data())

        if (profile.fcmTokens) {

            await admin.messaging().sendToDevice(profile.fcmTokens, {
                notification: {
                    title: `Repeat out loud 5 times`,
                    body: `${randomAffirmation}`,
                    clickAction: 'affirmation'
                }
            })
            
        }

    }

}

export async function scheduleNextAffirmation(uid: string, affirmations: IAffirmations): Promise<void> {

    const nextAffirmationDateTime: string = getNextAffirmationDate(affirmations)

    const task: IScheduledTaskUserExerciseAffirmations = {
        worker: enumWorkerType.userExerciseAffirmation,
        performAt: nextAffirmationDateTime,
        options: {
            userId: uid
        },
        status: enumTaskStatus.scheduled
    }

    await upsertScheduledTask(`${uid}affirmations`, task) 

}

export function getNextAffirmationDate(affirmations: IAffirmations): string {

    const currentDate = new Date()
    const dates: Date[] = []

    for (let i = 0; i < affirmations.times.length; i++ ) {

        const d = new Date(affirmations.times[i])
        const x = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), d.getHours(), d.getMinutes())
    
        if (x.getTime() < currentDate.getTime()) {

            dates.push(moment(x).add(1, 'day').toDate())

        } else {
            dates.push(x)
        }
    }

    let nextDate: Date = new Date(dates[0])
    for (let i = 1; i < dates.length; i++ ) {
        
        const d = new Date(dates[i])
        if (d.getTime() < nextDate.getTime()) nextDate = new Date(dates[i])

    }

    return nextDate.toISOString()

}