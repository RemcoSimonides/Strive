import { logger } from 'firebase-functions';
import { createComment, createGoalSource, Goal, User } from '@strive/model'
import { functions } from '../../../internals/firebase';
import { getDocument, toDate } from '../../../shared/utils';
import { addGoalEvent } from 'apps/backend-functions/src/shared/goal-event/goal.events';

export const commentCreatedHandler = functions.firestore.document(`Goals/{goalId}/Comments/{commentId}`)
  .onCreate(async (snapshot, context) =>{

    const comment = createComment(toDate({ ...snapshot.data(), id: snapshot.id }))
    const goalId: string = context.params.goalId

    logger.log(`comment created in goal ${goalId}: `, comment)

    const [goal, user] = await Promise.all([
      getDocument<Goal>(`Goals/${goalId}`),
      getDocument<User>(`Users/${comment.userId}`)
    ])

    const source = createGoalSource({ goal, user })
    addGoalEvent('goalChatMessageCreated', source)
  })