import { logger } from 'firebase-functions';
import { admin, db, functions } from '../../../internals/firebase';
import { Comment, createComment } from '@strive/discussion/+state/comment.firestore';
import { createDiscussion, Discussion } from '@strive/discussion/+state/discussion.firestore';
import { sendNotificationToUsers } from '../../../shared/notification/notification'
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumEvent } from '@strive/notification/+state/notification.firestore';

const { increment, arrayUnion } = admin.firestore.FieldValue

export const commentCreatedHandler = functions.firestore.document(`Discussions/{discussionId}/Comments/{commentId}`)
  .onCreate(async (snapshot, context) =>{

    const comment = createComment(snapshot.data())
    const discussionId: string = context.params.discussionId

    logger.log(`comment created in discussion ${discussionId}: `, comment)

    const discussionRef = db.doc(`Discussions/${discussionId}`)
    const discussionSnap = await discussionRef.get()
    if (discussionSnap.exists) {
      await discussionRef.update({
        numberOfComments: increment(1),
        commentators: arrayUnion(comment.user.uid)
      })

      // send notification to participants
      const discussion = createDiscussion(discussionSnap.data())
      sendNewMessageNotificationToParticipants(discussionId, discussion, comment)  
    } else {
      const discussion = createDiscussion({ numberOfComments: 1 })
      discussionRef.set(discussion)
    }
  })

function sendNewMessageNotificationToParticipants(discussionId: string, discussion: Discussion, comment: Comment) {
  logger.log(`Sending New Message Notification to Participants`)

  if (!discussion.commentators?.length) return

  // removing the user who sent the comment from participants
  discussion.commentators = discussion.commentators.filter(commentator => commentator !== comment.user.uid)

  const notification = createNotification({
    discussionId,
    event: enumEvent.discussionNewMessage,
    type: 'notification',
    target: 'user',
    source: {
      ...discussion.source,
      comment
    },
  })
  return sendNotificationToUsers(notification, discussion.commentators)
}
