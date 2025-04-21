import { onDocumentCreate } from '@strive/api/firebase'
import { upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task'
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface'
import { toDate } from 'apps/backend-functions/src/shared/utils'

export interface InviteToken {
  token: string
  deadline: Date
}

export const goalInviteTokenCreatedHandler = onDocumentCreate(`Goals/{goalId}/InviteTokens/{inviteTokenId}`,
async (snapshot) => {

  const inviteToken = createInviteToken(toDate({ ...snapshot.data }));
  const { goalId, inviteTokenId } = snapshot.params
  if (!inviteToken) return

  upsertScheduledTask(inviteTokenId, {
    worker: enumWorkerType.deleteInviteTokenGoal,
    performAt: inviteToken.deadline,
    options: { goalId, inviteTokenId }
  })
})

export function createInviteToken(data: Partial<InviteToken> = {}): InviteToken {
  return {
    token: data.token,
    deadline: data.deadline
  }
}