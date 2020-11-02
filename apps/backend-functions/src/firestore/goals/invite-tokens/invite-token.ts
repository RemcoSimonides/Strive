import { functions } from '../../../internals/firebase';
import { upsertScheduledTask } from '../../../shared/scheduled-task/scheduled-task';
import { enumWorkerType } from '../../../shared/scheduled-task/scheduled-task.interface';

export const goalInviteTokenCreatedHandler = functions.firestore.document(`Goals/{goalId}/InviteTokens/{inviteTokenId}`)
    .onCreate(async (snapshot, context) => {

        const inviteToken = snapshot.data()
        const goalId = context.params.goalId
        const inviteTokenId = context.params.inviteTokenId
        if (!inviteToken) return

        await upsertScheduledTask(inviteTokenId, {
            worker: enumWorkerType.deleteInviteTokenGoal,
            performAt: inviteToken.deadline,
            options: {
                goalId: goalId,
                inviteTokenId: inviteTokenId
            }
        })

    })