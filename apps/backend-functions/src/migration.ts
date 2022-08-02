// import { createGoalEvent, createStoryItem, storyEvents } from "@strive/model";
import { functions } from "./internals/firebase";
// import { toDate } from './shared/utils';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {
    // const eventsSnap = await db.collection('GoalEvents').get()

    // const batch = db.batch()

    // logger.log('events: ', eventsSnap.size)
    // for (const doc of eventsSnap.docs) {
    //   const event = createGoalEvent(toDate(doc.data()))
      
    //   if (!storyEvents.includes(event.name)) continue

    //   const storyItem = createStoryItem({
    //     date: event.createdAt,
    //     ...event
    //   })
    //   const goalId = storyItem.source.goal.id
    //   const ref = db.doc(`Goals/${goalId}/Story/${doc.id}`)
    //   batch.set(ref, storyItem)
    // }
    // batch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})