import { createGoalStakeholder, createUserLink, GoalLink, Milestone, receiverIsGoal, receiverIsUser, Support, UserLink } from '@strive/model'

/**
 * Return receiver if the goal has only 1 achiever
 */
export async function getReceiver(goalId: string, db: FirebaseFirestore.Firestore): Promise<UserLink | undefined> {
  const stakeholdersSnap = await db
    .collection(`Goals/${goalId}/GStakeholders`)
    .where('isAchiever', '==', true)
    .get();

  if (stakeholdersSnap.docs.length === 1) {
    const stakeholder = createGoalStakeholder(stakeholdersSnap.docs[0].data()) 
    return createUserLink(stakeholder)
  } else return undefined;
}

export function determineReceiver(support: Support, soloAchiever: UserLink, milestone?: Milestone): UserLink | GoalLink | undefined {
  const { receiver } = support.source

  if (receiver && receiverIsUser(receiver)) return receiver

  if (milestone.achiever?.uid) return milestone.achiever

  if (soloAchiever) return soloAchiever

  if (receiver && receiverIsGoal(receiver)) return receiver 

  return undefined
}