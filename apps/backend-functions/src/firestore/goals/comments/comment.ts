import { logger } from 'firebase-functions';
import { createComment, createGoalSource, enumEvent } from '@strive/model'
import { functions } from '../../../internals/firebase';
import { toDate } from '../../../shared/utils';
import { addGoalEvent } from 'apps/backend-functions/src/shared/goal-event/goal.events';

export const commentCreatedHandler = functions.firestore.document(`Goals/{goalId}/Comments/{commentId}`)
  .onCreate(async (snapshot, context) =>{

    const comment = createComment(toDate({ ...snapshot.data(), id: snapshot.id }))
    const goalId: string = context.params.goalId

    logger.log(`comment created in goal ${goalId}: `, comment)

    const source = createGoalSource({
      goal: comment.source.goal,
      user: comment.source.user
    })
    addGoalEvent(enumEvent.gNewMessage, source)
  })