import { onDocumentCreate } from '../../../internals/firebase'
import { upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'

export const goalInviteTokenCreatedHandler = onDocumentCreate(`Goals/{goalId}/InviteTokens/{inviteTokenId}`, 'goalInviteTokenCreatedHandler',
async (snapshot, context) => {

  const inviteToken = snapshot.data()
  const goalId = context.params.goalId
  const inviteTokenId = context.params.inviteTokenId
  if (!inviteToken) return

  upsertScheduledTask(inviteTokenId, {
    worker: enumWorkerType.deleteInviteTokenGoal,
    performAt: inviteToken.deadline,
    options: { goalId, inviteTokenId }
  })
})