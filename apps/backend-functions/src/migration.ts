import { createComment } from '@strive/model';
import { db, functions } from './internals/firebase';

export const migrate = functions.https.onRequest(async (req, res) => {

  try {

    const batch = db.batch()
    const goalsSnap = await db.collection('Goals').get()   
    for (const { id } of goalsSnap.docs) {
      
      const commentsSnap = await db.collection(`Goals/${id}/Comments`).get()
      for (const doc of commentsSnap.docs) {
        const data = createComment({ ...doc.data() })
        
        batch.set(doc.ref, {
          id: data.id,
          text: data.text,
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.createdAt
        })
      }
    }
    await batch.commit()

    res.status(200).send('all good')
  } catch (err) {
    console.error(err)
    res.status(400).send('Oh no! ABORT!')
  }
})