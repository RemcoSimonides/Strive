import { logger } from 'firebase-functions'
import { onDocumentCreate } from '../../../internals/firebase'

import { createComment } from '@strive/model'
import { toDate } from '../../../shared/utils'
import { addGoalEvent } from '../../../shared/goal-event/goal.events'

export const commentCreatedHandler = onDocumentCreate(`Goals/{goalId}/Comments/{commentId}`, 'commentCreatedHandler',
async (snapshot, context) =>{

  const comment = createComment(toDate({ ...snapshot.data(), id: snapshot.id }))
  const goalId: string = context.params.goalId
  const { userId } = comment

  logger.log(`comment created in goal ${goalId}: `, comment)

  addGoalEvent('goalChatMessageCreated', { goalId, userId, commentId: comment.id })
})