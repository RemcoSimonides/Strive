import { functions } from '../../../internals/firebase';
import { upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task';
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface';

export const collectiveGoalInviteTokenCreatedHandler = functions.firestore.document(`CollectiveGoals/{collectiveGoalId}/InviteTokens/{inviteTokenId}`)
  .onCreate((snapshot, context) => {
    const inviteToken = snapshot.data()
    const collectiveGoalId = context.params.collectiveGoalId
    const inviteTokenId = context.params.inviteTokenId

    if (!inviteToken) return

    upsertScheduledTask(inviteTokenId, {
        worker: enumWorkerType.deleteInviteTokenCollectiveGoal,
        performAt: inviteToken.deadline,
        options: { collectiveGoalId, inviteTokenId }
    })
  })