import { createGoalStakeholder } from "@strive/goal/stakeholder/+state/stakeholder.firestore";
import { createProfileLink, ProfileLink } from "@strive/user/user/+state/user.firestore";

/**
 * Return receiver if the goal has only 1 achiever
 */
export async function getReceiver( goalId: string, db: FirebaseFirestore.Firestore): Promise<ProfileLink> {
  const stakeholdersSnap = await db
    .collection(`Goals/${goalId}/GStakeholders`)
    .where('isAchiever', '==', true)
    .get();

  if (stakeholdersSnap.docs.length === 1) {
    const stakeholder = createGoalStakeholder(stakeholdersSnap.docs[0].data()) 
    return createProfileLink({
      uid: stakeholder.uid,
      username: stakeholder.username,
      photoURL: stakeholder.photoURL
    })
  } else return createProfileLink();
}
