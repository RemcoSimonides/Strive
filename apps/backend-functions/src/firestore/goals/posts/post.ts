import { functions } from '../../../internals/firebase';
import { createPost } from '@strive/post/+state/post.firestore';
import { getDocument, toDate } from '../../../shared/utils';
import { Goal, createGoalSource, enumEvent } from '@strive/model';
import { User } from '@strive/user/user/+state/user.firestore';
import { addGoalEvent } from '../goal.events';

export const postCreatedHandler = functions.firestore.document(`Goals/{goalId}/Posts/{postId}`)
  .onCreate(async (snapshot, context) => {

    const post = createPost(toDate({ ...snapshot.data(), id: snapshot.id }))
    const { postId } = context.params

    // event
    if (!post.isEvidence) {
      const [goal, user] = await Promise.all([
        getDocument<Goal>(`Goals/${post.goalId}`),
        getDocument<User>(`Users/${post.uid}`)
      ])

      const source = createGoalSource({ goal, user, postId })
      addGoalEvent(enumEvent.gNewPost, source, postId)
    }
  })