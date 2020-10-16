import { db, functions, admin } from '../../internals/firebase';

import * as moment from 'moment'
import * as sgMail from '@sendgrid/mail'

import { IGoalStakeholder, INotification } from '@strive/interfaces';
import { ICollectiveGoalStakeholder } from '@strive/collective-goal/stakeholder/+state/stakeholder.firestore';
import { Profile, User as IUser } from '@strive/user/user/+state/user.firestore';
import { sendgridAPIKey, sendgridTemplate } from '../../environments/environment';

const API_KEY = sendgridAPIKey;
const TEMPLATE_ID = sendgridTemplate;
sgMail.setApiKey(API_KEY)

// crontab.guru to determine schedule value
// export const scheduledEmailRunner = functions.pubsub.schedule('*/5 * * * *').onRun(async (context) => {
export const scheduledEmailRunner = functions.pubsub.schedule('5 8 * * 6').onRun(async (context) => {
    
    const dateWeekAgo = moment(context.timestamp).subtract(7, 'days').toDate()

    // get users
    const userColRef: admin.firestore.CollectionReference = db.collection(`Users`)
    const userColSnap: admin.firestore.QuerySnapshot = await userColRef.get()
    
    userColSnap.forEach(async userSnap => {

        const user: IUser = Object.assign(<IUser>{}, userSnap.data())

        let mail =  `
            <h1>Strive Journal update</h1>
            <h3>Missed notifications</h3>`

        const data: Data = await getData(userSnap.id, dateWeekAgo)
        if (!hasNewNotifications(data)) return
        mail += getGoalUpdatesHTML(data)
        mail += getCollectiveGoalUpdatesHTML(data)
        mail += getUserUpdates(data.user)

        console.log('email', user.email)
        console.log('mail', mail)
        await submitEmail(mail, user.email)

    })


})

function hasNewNotifications(data: Data): boolean {
    let hasUpdates = false

    data.collectiveGoals.forEach(collectiveGoal => {
        if (collectiveGoal.notifications.length > 0) {
            hasUpdates = true
        }
    })

    if (!hasUpdates) {
        data.goals.forEach(goal => {
            if (goal.notifications.length > 0) {
                hasUpdates = true
            }
        })
    }

    if (!hasUpdates) {
        if (data.user.notifications.length > 0) {
            hasUpdates = true
        }
    }

    return hasUpdates

}

async function getData(uid: string, fromDate: Date): Promise<Data> {

    const data: Data = {
        goals: [],
        collectiveGoals: [],
        user: { id: '', username: '', notifications: [] }
    }

    data.goals = await getGoals(uid, fromDate)
    data.collectiveGoals = await getCollectiveGoals(uid, fromDate)
    data.user = await getUserData(uid, fromDate)

    return  data
}

async function getGoals(uid: string, fromDate: Date): Promise<Goal[]> {

    const goals: Goal[] = []

    // get goals
    const GStakeholderColRef: admin.firestore.Query = db.collectionGroup(`GStakeholders`).where(`uid`, `==`, uid).where('goalIsFinished', '==', false)
    const GStakeholderColSnap: admin.firestore.QuerySnapshot = await GStakeholderColRef.get()

    for (const doc of GStakeholderColSnap.docs) {

        const GStakeholder: IGoalStakeholder = Object.assign(<IGoalStakeholder>{}, doc.data())
        const notifications: INotification[] = await getGoalNotifications(GStakeholder.goalId, fromDate)

        goals.push({
            id: GStakeholder.goalId,
            title: GStakeholder.goalTitle,
            notifications: notifications
        })

    }

    return goals

}

async function getGoalNotifications(goalId: string, fromDate: Date): Promise<INotification[]> {

    const notifications: INotification[] = []
    
    const notificationColRef: admin.firestore.Query = db.collection(`Goals/${goalId}/Notifications`).where('createdAt', '>=', fromDate).orderBy('createdAt')
    const notificationColSnap: admin.firestore.QuerySnapshot = await notificationColRef.get()
    notificationColSnap.docs.forEach(notificationSnap => {

        const notification: INotification = Object.assign(<INotification>{}, notificationSnap.data())
        notification.id = notificationSnap.id
        notifications.push(notification)

    })

    return notifications

}

async function getCollectiveGoals(uid: string, fromDate: Date): Promise<Goal[]> {

    const collectiveGoals: Goal[] = []

    // get goals
    const CGStakeholderColRef: admin.firestore.Query = db.collectionGroup(`CGStakeholders`).where(`uid`, `==`, uid)
    const CGStakeholderColSnap: admin.firestore.QuerySnapshot = await CGStakeholderColRef.get()

    for (const doc of CGStakeholderColSnap.docs) {

        const CGStakeholder: ICollectiveGoalStakeholder = Object.assign(<ICollectiveGoalStakeholder>{}, doc.data())
        const notifications: INotification[] = await getCollectiveGoalNotifications(CGStakeholder.collectiveGoalId, fromDate)

        collectiveGoals.push({
            id: CGStakeholder.collectiveGoalId,
            title: CGStakeholder.collectiveGoalTitle,
            notifications: notifications
        })

    }

    return collectiveGoals

}

async function getCollectiveGoalNotifications(collectiveGoalId: string, fromDate: Date): Promise<INotification[]> {

    const notifications: INotification[] = []
    
    const notificationColRef: admin.firestore.Query = db.collection(`ColleciveGoals/${collectiveGoalId}/Notifications`).where('createdAt', '>=', fromDate).orderBy('createdAt')
    const notificationColSnap: admin.firestore.QuerySnapshot = await notificationColRef.get()
    notificationColSnap.docs.forEach(notificationSnap => {

        const notification: INotification = Object.assign(<INotification>{}, notificationSnap.data())
        notification.id = notificationSnap.id
        notifications.push(notification)

    })

    return notifications

}

async function getUserData(uid: string, fromDate: Date): Promise<User> {

    const user = <User>{}
    user.notifications = []

    // get user
    const profileDocRef: admin.firestore.DocumentReference = db.doc(`Users/${uid}/Profile/${uid}`)
    const profileDocSnap: admin.firestore.DocumentSnapshot = await profileDocRef.get()
    const profile: Profile = Object.assign(<Profile>{}, profileDocSnap.data())

    user.id = uid
    user.username = profile.username

    const notificationsColRef: admin.firestore.Query = db.collection(`Users/${uid}/Notifications`).where('event', '>=', 400000).where('event', '<', 500000)
    const notificationsColSnap: admin.firestore.QuerySnapshot = await notificationsColRef.get()
    
    notificationsColSnap.docs.forEach(notificationSnap => {

        const notification: INotification = Object.assign(<INotification>{}, notificationSnap.data())
        notification.id = notificationSnap.id

        user.notifications.push(notification)

    })

    user.notifications.filter((notification) => {
        if (!!notification.createdAt) {
          return notification.createdAt.toDate() >= fromDate ? true : false;
        } else {
          return false;
        }
    })

    return user

}

function getGoalUpdatesHTML(data: Data): string {

    let html = '' 

    data.goals.forEach(goal => {
        html += getGoalUpdateHTML(goal)
    })
    

    return html
}

function getGoalUpdateHTML(goal: Goal): string {

    let html = `<h2>${goal.title}</h2>`

    if (goal.notifications.length === 0) {

        html += 'no updates'

    } else {

        html += getNotificationListHTML(goal.notifications)

    }

    return html

}

function getNotificationListHTML(notifications: INotification[]): string {

    let html = '<ul>'

    notifications.forEach(notification => {

        const date = moment.unix(notification.createdAt?.seconds || 0).format('MMM Do, h:mm a')
        const messageText: string = notification.message.map(messageObj => messageObj.text).join(' ')

        html += `<li>${date}: ${messageText}</li>`
    })

    html += '</ul>'

    return html

}

function getCollectiveGoalUpdatesHTML(data: Data): string {

    let html = '' 

    data.collectiveGoals.forEach(collectiveGoal => {
        html += getCollectiveGoalUpdateHTML(collectiveGoal)
    })
    
    return html

}

function getCollectiveGoalUpdateHTML(collectiveGoal: CollectiveGoal): string {

    let html = `<h2>${collectiveGoal.title}</h2>`

    if (collectiveGoal.notifications.length === 0) {

        html += 'no updates'

    } else {

        html += getNotificationListHTML(collectiveGoal.notifications)

    }

    return html

}

function getUserUpdates(user: User): string {

    let html = '<h2>Your personal notifications</h2>'

    if (user.notifications.length === 0) {
        html += 'no updates'
    } else {
        html += getNotificationListHTML(user.notifications)
    }

    return html
}

async function submitEmail(mail: string, receiverEmailAddress: string): Promise<void> {

    console.log('trying to submit email', receiverEmailAddress)

    const msg = {
        to: 'remcosimonides@gmail.com',
        from: 'remco@lets.support',
        templateId: TEMPLATE_ID,
        dynamic_template_data: {
            subject: 'Weekly Update',
            body: mail
        }
    }

    await sgMail.send(msg)

}

interface Data {
    collectiveGoals: CollectiveGoal[];
    goals: Goal[];
    user: User;
}

interface Goal {
    id: string;
    title: string;
    notifications: INotification[];
}

interface CollectiveGoal {
    id: string;
    title: string;
    notifications: INotification[];
}

interface User {
    id: string;
    username: string;
    notifications: INotification[];
}

// class EventAggregation {

//     // goal events
//     goalsFinished: number = 0

//     // roadmap/milestone events
//     milestonesCompleted: number = 0
//     milestonesCompletedSuccessfully: number = 0
//     milestonesCompletedUnsuccessfully: number = 0

//     // stakeholder events
//     gStakeholderAchieverAdded: number = 0
//     gStakeholderAchieverRemoved: number = 0
//     gStakeholderAdminAdded: number = 0
//     gStakeholderAdminRemoved: number = 0
//     gStakeholderSupporterAdded: number = 0
//     gStakeholderSupporterRemoved: number = 0
//     gStakeholderRequestToJoinPending: number = 0
//     gStakeholderRequestToJoinAccepted: number = 0
//     gStakeholderRequestToJoinRejected: number = 0

//     // support events
//     addedSupports: number = 0


//     // constructor() {}

//     public aggregate(event: enumEvent) {

//         switch(event) {
//             // goal events
//             case enumEvent.gFinished: {
//                 ++this.goalsFinished
//                 break
//             }
            
//             // roadmap/milestone events
//             case enumEvent.gMilestoneCompletedSuccessfully: {
//                 ++this.milestonesCompleted
//                 ++this.milestonesCompletedSuccessfully
//                 break
//             }
//             case enumEvent.gMilestoneCompletedUnsuccessfully: {
//                 ++this.milestonesCompleted
//                 ++this.milestonesCompletedUnsuccessfully
//                 break
//             }

//             // support events
//             case enumEvent.gSupportAdded: {
//                 ++this.addedSupports
//                 break
//             }

//             // stakeholder events
//             case enumEvent.gStakeholderAchieverAdded: {
//                 ++this.gStakeholderAchieverAdded
//                 break
//             }
//             case enumEvent.gStakeholderAchieverRemoved: {
//                 ++this.gStakeholderAchieverRemoved
//                 break
//             }
//             case enumEvent.gStakeholderAdminAdded: {
//                 ++this.gStakeholderAdminAdded
//                 break
//             }
//             case enumEvent.gStakeholderAdminRemoved: {
//                 ++this.gStakeholderAdminRemoved
//                 break
//             }
//             case enumEvent.gStakeholderSupporterAdded: {
//                 ++this.gStakeholderSupporterAdded
//                 break
//             }
//             case enumEvent.gStakeholderSupporterRemoved: {
//                 ++this.gStakeholderSupporterRemoved
//                 break
//             }


//         }

//     }

// }
