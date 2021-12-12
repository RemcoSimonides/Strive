// import { Goal } from "@strive/goal/goal/+state/goal.firestore";
// import { GoalStakeholder } from "@strive/goal/stakeholder/+state/stakeholder.firestore";
// import { db, functions } from "./internals/firebase";
// import { logger } from 'firebase-functions';
// import { createUser } from "@strive/user/user/+state/user.firestore";

// export const migrate = functions.https.onRequest(async (req, res) => {

//   try {

//     const profilesSnap = await db.collectionGroup('Profile').get();
//     const usersSnap = await db.collection('Users').get()

//     const promises = []

//     for (const doc of profilesSnap.docs) {
//       const profile = createProfile({ ...doc.data(), uid: doc.id })

//       const promise = db.collection('Users').doc(profile.uid).set(profile)
//       promises.push(promise)
//     }

//     await Promise.all(promises)

//     res.status(200).send('all good')
//   } catch (err) {
//     console.error(err)
//     res.status(400).send('Oh no! ABORT!')
//   }
// })