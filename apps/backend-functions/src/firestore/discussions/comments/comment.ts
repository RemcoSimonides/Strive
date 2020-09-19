import { admin, db, functions } from '../../../internals/firebase';
import { IComment, IDiscussion, INotificationBase, enumEvent, ISource } from '@strive/interfaces';
import { sendNotificationToUsers } from '../../../shared/notification/notification'

const { increment, arrayUnion } = admin.firestore.FieldValue

export const commentCreatedHandler = functions.firestore.document(`Discussions/{discussionId}/Comments/{commentId}`)
    .onCreate(async (snapshot, context) =>{

        const comment: IComment = Object.assign(<IComment>{}, snapshot.data())
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
            const discussion: IDiscussion = Object.assign(<IDiscussion>{}, discussionSnap.data())
            await sendNewMessageNotificationToParticipants(discussionId, discussion, comment)
            
        } else {
            await discussionRef.set({
                numberOfComments: 1,
                participants: []
            })
        }

    })

async function sendNewMessageNotificationToParticipants(discussionId: string, discussion: IDiscussion, comment: IComment): Promise<void> {
    console.log(`executing Send New Message Notification to Participants`)

    if (!discussion.commentators) return

    // removing the user who sent the comment from participants
    const index = discussion.commentators.indexOf(comment.uid)
    if (index !== -1) discussion.commentators.splice(index, 1)

    const source: ISource =  Object.assign(<ISource>{}, discussion.source)

    const notification: Partial<INotificationBase> = {
        discussionId: discussionId,
        event: enumEvent.discussionNewMessage,
        source: source,
        message: [
            {
                text: `New comment '${comment.text}' from `
            },
            {
                text: comment.username,
                link: `profile/${comment.uid}`
            }
        ]
    }
    await sendNotificationToUsers(notification, discussion.commentators)

}
