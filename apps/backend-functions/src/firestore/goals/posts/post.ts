import { functions } from '../../../internals/firebase';
import { getDocument, toDate } from '../../../shared/utils';
import { Goal, createGoalSource, createPost, User } from '@strive/model';
import { addGoalEvent } from '../../../shared/goal-event/goal.events'
import { addStoryItem } from '../../../shared/goal-story/story'

export const postCreatedHandler = functions.firestore.document(`Goals/{goalId}/Posts/{postId}`)
  .onCreate(async (snapshot, context) => {

    const post = createPost(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { postId } = context.params

    // event
    const [goal, user] = await Promise.all([
      getDocument<Goal>(`Goals/${post.goalId}`),
      getDocument<User>(`Users/${post.uid}`)
    ])

    const source = createGoalSource({ goal, user, postId })
    addGoalEvent('goalStoryPostCreated', source, postId)
    addStoryItem('goalStoryPostCreated', source, postId, post.date)
})