import { db, functions, gcsBucket } from '../../../internals/firebase'
import { toDate } from '../../../shared/utils'
import { createGoalSource, createPost } from '@strive/model'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'
import { isEqual } from 'date-fns'

export const postCreatedHandler = functions.firestore.document(`Goals/{goalId}/Posts/{postId}`)
  .onCreate(async (snapshot, context) => {

    const post = createPost(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { postId } = context.params

    const source = createGoalSource({
      goalId: post.goalId,
      userId: post.uid,
      milestoneId: post.milestoneId,
      postId
    })
    addGoalEvent('goalStoryPostCreated', source, postId)
    addStoryItem('goalStoryPostCreated', source, postId, post.date)
})

export const postChangeHandler = functions.firestore.document(`Goals/{goalId}/Posts/{postId}`)
  .onUpdate(async (snapshot, context) => {

  const { goalId } = context.params
  const before = createPost(toDate({ ...snapshot.before.data(), id: snapshot.before.id }))
  const after = createPost(toDate({ ...snapshot.after.data(), id: snapshot.after.id }))

  if (!isEqual(before.date, after.date)) {
    db.doc(`Goals/${goalId}/Story/${after.id}`).update({ date: after.date })
  }
})

export const postDeletedHandler = functions.firestore.document(`Goals/{goalId}/Posts/{postId}`).onDelete(async (snapshot, context) => {
  const { goalId, postId } = context.params
  const post = createPost(toDate({ ...snapshot.data(), id: snapshot.id }))

  if (post.mediaURL) {
    gcsBucket.file(post.mediaURL).delete({ ignoreNotFound: true })
  }
  
  db.doc(`Goals/${goalId}/Story/${postId}`).delete()
})