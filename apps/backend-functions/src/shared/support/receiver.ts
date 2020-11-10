export interface IReceiver {
  id: string | null;
  username: string | null;
  photoURL: string | null;
}

export async function getReceiver( goalId: string, db: FirebaseFirestore.Firestore): Promise<IReceiver> {
  const stakeholdersColRef: FirebaseFirestore.Query = db
    .collection(`Goals/${goalId}/GStakeholders`)
    .where('isAchiever', '==', true);
  const stakeholdersSnap: FirebaseFirestore.QuerySnapshot = await stakeholdersColRef.get();

  if (stakeholdersSnap.docs.length === 1) {
    const receiver = <IReceiver>{};

    stakeholdersSnap.docs.forEach((stakeholderSnap) => {
      const stakeholder = stakeholderSnap.data();
      receiver.id = stakeholder.uid;
      receiver.username = stakeholder.username;
      receiver.photoURL = stakeholder.photoURL;
    });

    return receiver;
  } else {
    return {
      id: null,
      username: null,
      photoURL: null,
    };
  }
}
