import { functions } from '../../../internals/firebase';
import { INotificationWithPost, enumNotificationType, enumEvent, IPost, enumDiscussionAudience } from '@strive/interfaces';
import { sendNotificationToGoalStakeholders, sendNotificationToGoal, createDiscussion } from '../../../shared/notification/notification'

export const postCreatedHandler = functions.firestore.document(`Goals/{goalId}/Posts/{postId}`)
    .onCreate(async (snapshot, context) => {

        const post: IPost = Object.assign(<IPost>{}, snapshot.data())
        const goalId = context.params.goalId
        const postId = context.params.postId
        if (!post) return

        if (!post.isEvidence) {
            await createDiscussion(post.content.title, { image: post.goal.image, name: `Discussion - ${post.content.title}`, goalId: post.goal.id }, enumDiscussionAudience.public, postId)
            await sendNotificationNewPost(goalId, postId, post)
        }

    })

// NEW POST
async function sendNotificationNewPost(goalId: string, postId: string, post: IPost): Promise<void> {

    const notification: Partial<INotificationWithPost> = {
        discussionId: postId,
        event: enumEvent.gNewPost,
        source: {
            image: post.goal.image,
            name: post.goal.title,
            goalId: goalId,
            postId: postId
        },
        notificationType: enumNotificationType.post,
        path: {
            goalId: goalId,
            postId: postId
        }
    }
    await sendNotificationToGoal(goalId, notification)

    notification.message = [
        {
            text: post.author.username,
            link: `profile/${post.author.id}`
        },
        {
            text: ` just created a new post`
        },
    ]
    await sendNotificationToGoalStakeholders(goalId, notification, true, true, true)

}