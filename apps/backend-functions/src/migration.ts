import { Aggregation, createGoal, createGoalEvent, createGoalStakeholder, createNotification, createStoryItem, createSupport, EventType, Goal, User } from '@strive/model';
import { db, functions, logger } from './internals/firebase';
import { updateAggregation } from './shared/aggregation/aggregation';
import { getCollection, toDate } from './shared/utils';

enum enumEvent {
  // 200000 -> 299999 = goal events
  gNew = 200001, //deprecated
  gNewBucketlist = 200010,
  gNewActive = 200011,
  gNewFinished = 200012,
  gFinished = 200002,
  gUpdated = 200003,
  gRoadmapUpdated = 204001,
  gMilestoneCompletedSuccessfully = 201001,
  gMilestoneCompletedUnsuccessfully = 201002,
  gMilestoneDeadlinePassed = 201010,
  gStakeholderAchieverAdded = 202001,
  gStakeholderAchieverRemoved = 202002,
  gStakeholderAdminAdded = 202003,
  gStakeholderAdminRemoved = 202004,
  gStakeholderSupporterAdded = 202005,
  gStakeholderSupporterRemoved = 202006,
  gStakeholderRequestToJoinPending = 202101,
  gStakeholderRequestToJoinAccepted = 202102,
  gStakeholderRequestToJoinRejected = 202103,
  gSupportAdded = 203010,
  gSupportWaitingToBePaid = 203020,
  gSupportPaid = 203030,
  gSupportRejected = 203040,
  gSupportPendingSuccesful = 203050, // succeeded achieving objective
  gSupportPendingFailed = 203051, // failed achieving objective
  gSupportDeleted = 203060,
  gNewPost = 205001,
  gNewMessage = 206001,
  // 400000 -> 499999 = user events
  userSpectatorAdded = 400001,
  userSpectatorRemoved = 400002,
}

const map: Record<enumEvent, EventType> = {
  200001: '', // gNew
  200010: 'goalCreatedStatusBucketlist', // gNewBucketlist
  200011: 'goalCreatedStatusActive', // gNewActive
  200012: 'goalCreatedStatusFinished', // gNewFinished
  200002: 'goalStatusFinished', // gFinished
  200003: '', // gUpdated
  204001: '', // gRoadmapUpdated
  201001: 'goalMilestoneCompletedSuccessfully', // gMilestoneCompletedSuccessfully
  201002: 'goalMilestoneCompletedUnsuccessfully', // gMilestoneCompletedUnsuccessfully
  201010: 'goalMilestoneDeadlinePassed', // gMilestoneDeadlinePassed,
  202001: 'goalStakeholderBecameAchiever', // gStakeholderAchieverAdded
  202002: '', // gStakeholderAchieverRemoved = 202002,
  202003: 'goalStakeholderBecameAdmin', // gStakeholderAdminAdded = 202003,
  202004: '', // gStakeholderAdminRemoved = 202004,
  202005: 'goalStakeholderBecameSupporter', // gStakeholderSupporterAdded = 202005,
  202006: '', // gStakeholderSupporterRemoved = 202006,
  202101: 'goalStakeholderRequestedToJoin', // gStakeholderRequestToJoinPending = 202101,
  202102: 'goalStakeholderRequestToJoinAccepted', // gStakeholderRequestToJoinAccepted = 202102,
  202103: 'goalStakeholderRequestToJoinRejected', // gStakeholderRequestToJoinRejected = 202103,
  203010: 'goalSupportCreated', // gSupportAdded = 203010,
  203020: 'goalSupportStatusWaitingToBePaid', // gSupportWaitingToBePaid = 203020,
  203030: 'goalSupportStatusPaid', // gSupportPaid = 203030,
  203040: 'goalSupportStatusRejected', // gSupportRejected = 203040,
  203050: 'goalSupportStatusPendingSuccessful', // gSupportPendingSuccesful = 203050, // succeeded achieving objective
  203051: 'goalSupportStatusPendingUnsuccessful', // gSupportPendingFailed = 203051, // failed achieving objective
  203060: 'goalSupportDeleted', // gSupportDeleted = 203060,
  205001: 'goalStoryPostCreated', // gNewPost = 205001,
  206001: 'goalChatMessageCreated', // gNewMessage = 206001,
  
  400001: 'userSpectatorCreated', // userSpectatorAdded = 400001,
  400002: 'userSpectatorDeleted' // userSpectatorRemoved = 400002,
}

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    const [goalEventsSnap, goals, users] = await Promise.all([
      db.collection(`GoalEvents`).get(),
      getCollection<Goal>('Goals'),
      getCollection<User>('Users')
    ])

    logger.log('size: ', goalEventsSnap.size)

    const batch = db.batch()
    for (const doc of goalEventsSnap.docs) {
      const event = createGoalEvent(toDate(doc.data()))
      const value = map[event.name]

      if (!value) {
        batch.delete(doc.ref)
        continue
      }
      
      event.name = value
      batch.update(doc.ref, { ...event })
    }

    batch.commit()

    for (const goal of goals) {
      const storySnap = await db.collection(`Goals/${goal.id}/Story`).get()
      const storyBatch = db.batch()
      logger.log('story size: ', storySnap.size)

      for (const doc of storySnap.docs) {
        const event = createStoryItem(toDate(doc.data()))
        const value = map[event.name]
  
        if(!value) {
          storyBatch.delete(doc.ref)
          continue
        }
  
        event.name = value
        storyBatch.update(doc.ref, { ...event })
      }
      storyBatch.commit()
    }

    for (const user of users) {
      const notificationsSnap = await db.collection(`Users/${user.uid}/Notifications`).get()
      const notificationBatch = db.batch()
      logger.log('notifications: ', notificationsSnap.size)

      for (const doc of notificationsSnap.docs) {
        const notification = createNotification(toDate(doc.data()))
        const value = map[notification.event]

        if (!value) {
          notificationBatch.delete(doc.ref)
          continue
        }

        notification.event = value
        notificationBatch.update(doc.ref, { ...notification })
      }
      notificationBatch.commit()
    }

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})