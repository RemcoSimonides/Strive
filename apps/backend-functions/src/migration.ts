import { Aggregation, createGoal, createGoalStakeholder, createSupport } from "@strive/model";
import { db, functions, logger } from "./internals/firebase";
import { updateAggregation } from "./shared/aggregation/aggregation";
import { toDate } from './shared/utils';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    // const goalsSnap = await db.collection(`Goals`).get()
    // const goals = goalsSnap.docs.map(doc => createGoal(toDate({ ...doc.data(), id: doc.id })))
    
    // const goalStakeholdersSnap = await db.collectionGroup(`GStakeholders`).get()
    // const stakeholders = goalStakeholdersSnap.docs.map(doc => createGoalStakeholder(toDate({ ...doc.data(), id: doc.id })))

    // const supportsSnap = await db.collectionGroup(`Supports`).get()
    // const supports = supportsSnap.docs.map(doc => createSupport(toDate({ ...doc.data(), id: doc.id })))

    // const usersSnap = await db.collection(`Users`).get()

    // const aggregation: Aggregation = {
    //   goalsCreated: goals.length,
    //   goalsActive: goals.filter(goal => goal.status === 'active').length,
    //   goalsFinished: goals.filter(goal => goal.status === 'finished').length,
    //   goalsBucketlist: goals.filter(goal => goal.status === 'finished').length,
    //   goalsPrivate: goals.filter(goal => goal.publicity === 'private').length,
    //   goalsPublic: goals.filter(goal => goal.publicity === 'public').length,
    //   goalsAchievers: stakeholders.filter(stakeholder => stakeholder.isAchiever).length,
    //   goalsSupporters: stakeholders.filter(stakeholder => stakeholder.isSupporter).length,
    //   goalsAdmins: stakeholders.filter(stakeholder => stakeholder.isAdmin).length,
    //   goalsCustomSupports: supports.length,
    //   goalsDeleted: 0,
    //   usersCreated: usersSnap.size,
    //   usersDeleted: 0
    // }

    // updateAggregation(aggregation)

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})