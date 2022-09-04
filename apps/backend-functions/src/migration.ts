import { createGoalEvent, createMilestone, createStoryItem, EventType, Goal } from '@strive/model';
import { db, functions, logger } from './internals/firebase';
import { toDate } from './shared/utils';

function renameEvent(event: string): EventType | undefined {
  if (event === 'goalStatusFinished') return 'goalIsFinished'
  if (event === 'goalCreatedStatusBucketList' || event === 'goalCreatedStatusActive') return 'goalCreated'
  if (event === 'goalCreatedStatusFinished') return 'goalCreatedFinished'
}

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    // get all goal events
    const goalEventsSnap = await db.collection('GoalEvents').get()
    const batch = db.batch()

    for (const doc of goalEventsSnap.docs) {
      const event = createGoalEvent(toDate(doc.data()))

      const name = renameEvent(event.name)
      if (name) {
        batch.update(doc.ref, { name })
      }
    }
    await batch.commit()

    // get all story events
    const goalsSnap = await db.collection('Goals').get()
    const storyBatch = db.batch()

    for (const { id, ref } of goalsSnap.docs) {
      const storySnap = await db.collection(`Goals/${id}/Story`).get()

      for (const doc of storySnap.docs) {
        const storyItem = createStoryItem(doc.data())

        const name = renameEvent(storyItem.name)
        if (name) {
          logger.log('story item: ', storyItem)
          logger.log('ref: ', doc.ref.path)
          storyBatch.update(doc.ref, { name })
        }
      }
    }

    await storyBatch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})