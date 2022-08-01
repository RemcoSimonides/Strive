import { logger } from 'firebase-functions';
import { db, functions, increment, arrayUnion } from '../../../internals/firebase';
import { createComment } from '@strive/discussion/+state/comment.firestore';
import { createDiscussion } from '@strive/discussion/+state/discussion.firestore';
import { createGoalSource, enumEvent } from '@strive/model'
import { toDate } from '../../../shared/utils';
import { addGoalEvent } from '../../goals/goal.events';

export const commentCreatedHandler = functions.firestore.document(`Discussions/{discussionId}/Comments/{commentId}`)
  .onCreate(async (snapshot, context) =>{

    const comment = createComment(toDate({ ...snapshot.data(), id: snapshot.id }))
    const discussionId: string = context.params.discussionId

    logger.log(`comment created in discussion ${discussionId}: `, comment)

    const discussionRef = db.doc(`Discussions/${discussionId}`)
    const discussionSnap = await discussionRef.get()
    const discussion = createDiscussion(toDate({ ...discussionSnap.data(), id: discussionSnap.id }))

    if (discussionSnap.exists) {
      await discussionRef.update({
        numberOfComments: increment(1),
        commentators: arrayUnion(comment.user.uid)
      })

      const source = createGoalSource({
        goal: discussion.source.goal,
        user: comment.user
      })
      addGoalEvent(enumEvent.gNewMessage, source)

    } else {
      const discussion = createDiscussion({ numberOfComments: 1, commentators: [comment.user.uid] })
      discussionRef.set(discussion)
    }
  })