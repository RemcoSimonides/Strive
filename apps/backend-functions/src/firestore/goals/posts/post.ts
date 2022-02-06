import { functions } from '../../../internals/firebase';
import { enumEvent, Source } from '@strive/notification/+state/notification.firestore'
import { createPost, Post } from '@strive/post/+state/post.firestore';
import { sendNotificationToGoalStakeholders, sendNotificationToGoal, addDiscussion } from '../../../shared/notification/notification'
import { createNotification } from '@strive/notification/+state/notification.model';
import { getDocument } from '../../../shared/utils';
import { createGoalLink, getAudience, Goal } from '@strive/goal/goal/+state/goal.firestore';
import { createUserLink, User } from '@strive/user/user/+state/user.firestore';

export const postCreatedHandler = functions.firestore.document(`Goals/{goalId}/Posts/{postId}`)
  .onCreate(async (snapshot, context) => {

    const post = createPost(snapshot.data())
    const goalId = context.params.goalId
    const postId = context.params.postId

    if (!post.isEvidence) {
      await sendNotificationNewPost(goalId, postId, post)
    }
  })

async function sendNotificationNewPost(goalId: string, postId: string, post: Post) {
  const [goal, user] = await Promise.all([
    getDocument<Goal>(`Goals/${post.goalId}`),
    getDocument<User>(`Users/${post.uid}`)
  ])

  const source: Source = {
    goal: createGoalLink(goal),
    user: createUserLink(user),
    postId
  }

  const audience = getAudience(goal.publicity)
  await addDiscussion(post.title, source, audience, postId)

  const notification = createNotification({
    id: postId,
    discussionId: postId,
    event: enumEvent.gNewPost,
    type: 'feed',
    source
  })
  sendNotificationToGoal(goalId, notification)

  sendNotificationToGoalStakeholders(goalId, notification, post.uid, true, true, true)
}