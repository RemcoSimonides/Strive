import { createGoalStakeholder, createUserLink, UserLink } from '@strive/model'

/**
 * Return receiver if the goal has only 1 achiever
 */
export async function getReceiver( goalId: string, db: FirebaseFirestore.Firestore): Promise<UserLink> {
  const stakeholdersSnap = await db
    .collection(`Goals/${goalId}/GStakeholders`)
    .where('isAchiever', '==', true)
    .get();

  if (stakeholdersSnap.docs.length === 1) {
    const stakeholder = createGoalStakeholder(stakeholdersSnap.docs[0].data()) 
    return createUserLink(stakeholder)
  } else return createUserLink();
}
