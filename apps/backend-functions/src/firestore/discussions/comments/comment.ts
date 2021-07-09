import { admin, db, functions } from '../../../internals/firebase';
import { Comment } from '@strive/discussion/+state/comment.firestore';
import { Discussion } from '@strive/discussion/+state/discussion.firestore';
import { sendNotificationToUsers } from '../../../shared/notification/notification'
import { createNotification } from '@strive/notification/+state/notification.model';
import { enumEvent } from '@strive/notification/+state/notification.firestore';

const { increment, arrayUnion } = admin.firestore.FieldValue

export const commentCreatedHandler = functions.firestore.document(`Discussions/{discussionId}/Comments/{commentId}`)
  .onCreate(async (snapshot, context) =>{

    const comment = Object.assign(<Comment>{}, snapshot.data())
    const discussionId: string = context.params.discussionId
    if (!comment) return

    console.log(`comment created in discussion ${discussionId}: `, comment)

    const discussionRef = db.doc(`Discussions/${discussionId}`)
    const discussionSnap = await discussionRef.get()
    if (discussionSnap.exists) {
      await discussionRef.update({
        numberOfComments: increment(1),
        commentators: arrayUnion(comment.uid)
      })

      // send notification to participants
      const discussion: Discussion = Object.assign(<Discussion>{}, discussionSnap.data())
      sendNewMessageNotificationToParticipants(discussionId, discussion, comment)  
    } else {
      discussionRef.set({ numberOfComments: 1, participants: [] })
    }
  })

function sendNewMessageNotificationToParticipants(discussionId: string, discussion: Discussion, comment: Comment) {
  console.log(`Sending New Message Notification to Participants`)

  if (!discussion.commentators) return

  // removing the user who sent the comment from participants
  const index = discussion.commentators.indexOf(comment.uid)
  if (index !== -1) discussion.commentators.splice(index, 1)

  const notification = createNotification({
    discussionId: discussionId,
    event: enumEvent.discussionNewMessage,
    type: 'notification',
    source: discussion.source,
    message: [
      {
        text: `New comment '${comment.text}' from `
      },
      {
        text: comment.username,
        link: `profile/${comment.uid}`
      }
    ]
  })
  return sendNotificationToUsers(notification, discussion.commentators)
}
