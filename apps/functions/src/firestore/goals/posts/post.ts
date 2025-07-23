import { db, onDocumentCreate, onDocumentDelete, onDocumentUpdate } from '@strive/api/firebase'
import { toDate } from '../../../shared/utils'
import { createGoalSource, createPost } from '@strive/model'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'
import { isEqual } from 'date-fns'

export const postCreatedHandler = onDocumentCreate(`Goals/{goalId}/Posts/{postId}`,
async (snapshot) => {

  const { postId } = snapshot.params
  const post = createPost(toDate({ ...snapshot.data.data(), id: postId }))

  const source = createGoalSource({
    goalId: post.goalId,
    userId: post.uid,
    milestoneId: post.milestoneId,
    postId
  })
  addGoalEvent('goalStoryPostCreated', source, postId)
  addStoryItem('goalStoryPostCreated', source, postId, post.date)
})

export const postChangeHandler = onDocumentUpdate(`Goals/{goalId}/Posts/{postId}`,
async (snapshot) => {

  const { goalId, postId } = snapshot.params
  const before = createPost(toDate({ ...snapshot.data.before.data(), id: postId }))
  const after = createPost(toDate({ ...snapshot.data.after.data(), id: postId }))

  if (!isEqual(before.date, after.date)) {
    db.doc(`Goals/${goalId}/Story/${after.id}`).update({ date: after.date })
  }
})

export const postDeletedHandler = onDocumentDelete(`Goals/{goalId}/Posts/{postId}`,
async (snapshot) => {
  const { goalId, postId } = snapshot.params
  const post = createPost(toDate({ ...snapshot.data.data(), id: postId }))

  const mediaRefs = post.mediaIds.map(mediaId => `Goals/${goalId}/Media/${mediaId}`)
  const batch = db.batch()

  for (const ref of mediaRefs) {
    batch.delete(db.doc(ref))
  }

  await batch.commit()

  db.doc(`Goals/${goalId}/Story/${postId}`).delete()
})