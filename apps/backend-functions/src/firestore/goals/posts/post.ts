import { functions } from '../../../internals/firebase';
import { enumEvent, Source } from '@strive/notification/+state/notification.firestore'
import { createPost, Post } from '@strive/post/+state/post.firestore';
import { sendNotificationToGoalStakeholders, sendNotificationToGoal, addDiscussion } from '../../../shared/notification/notification'
import { createNotification } from '@strive/notification/+state/notification.model';
import { getDocument } from '../../../shared/utils';
import { getAudience, Goal } from '@strive/goal/goal/+state/goal.firestore';

export const postCreatedHandler = functions.firestore.document(`Goals/{goalId}/Posts/{postId}`)
  .onCreate(async (snapshot, context) => {

    const post = createPost(snapshot.data())
    const goalId = context.params.goalId
    const postId = context.params.postId

    if (!post.isEvidence) {
      sendNotificationNewPost(goalId, postId, post)
    }
  })

async function sendNotificationNewPost(goalId: string, postId: string, post: Post) {

  const source: Source = {
    goal: post.goal,
    user: post.author,
    postId
  }

  const goal = await getDocument<Goal>(`Goals/${goalId}`)
  const audience = getAudience(goal.publicity)

  await addDiscussion(post.content.title, source, audience, postId)

  const notification = createNotification({
    discussionId: postId,
    event: enumEvent.gNewPost,
    type: 'feed',
    source
  })
  sendNotificationToGoal(goalId, notification)

  sendNotificationToGoalStakeholders(goalId, notification, post.author.uid, true, true, true)
}