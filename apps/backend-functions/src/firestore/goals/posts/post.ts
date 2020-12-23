import { functions } from '../../../internals/firebase';
import { enumEvent } from '@strive/notification/+state/notification.firestore'
import { Post } from '@strive/post/+state/post.firestore';
import { sendNotificationToGoalStakeholders, sendNotificationToGoal, createDiscussion } from '../../../shared/notification/notification'
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumDiscussionAudience } from '@strive/interfaces';

export const postCreatedHandler = functions.firestore.document(`Goals/{goalId}/Posts/{postId}`)
  .onCreate(async (snapshot, context) => {

    const post: Post = Object.assign(<Post>{}, snapshot.data())
    const goalId = context.params.goalId
    const postId = context.params.postId
    if (!post) return

    if (!post.isEvidence) {
      await createDiscussion(post.content.title, { image: post.goal.image, name: `Discussion - ${post.content.title}`, goalId: post.goal.id }, enumDiscussionAudience.public, postId)
      sendNotificationNewPost(goalId, postId, post)
    }
  })

// NEW POST
function sendNotificationNewPost(goalId: string, postId: string, post: Post) {

  const notification = createNotification({
    discussionId: postId,
    event: enumEvent.gNewPost,
    source: {
        image: post.goal.image,
        name: post.goal.title,
        goalId: goalId,
        postId: postId
    }
  })
  sendNotificationToGoal(goalId, notification)

  notification.message = [
    {
      text: post.author.username,
      link: `profile/${post.author.id}`
    },
    {
      text: ` just created a new post`
    },
  ]
  sendNotificationToGoalStakeholders(goalId, notification, true, true, true)
}