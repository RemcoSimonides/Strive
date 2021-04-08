import * as admin from 'firebase-admin';

export interface ErrorResultResponse {
  error: string;
  result: any;
}

export const converter = <T>(factory?: Function) => {
  return {
    toFirestore(model: T): T { return model },
    fromFirestore(snap: admin.firestore.QueryDocumentSnapshot<T>) {
      const data = { ...snap.data(), id: snap.id }
      return !!factory ? factory(data) : data;
    }
  }
}

export function getDocument<T>(path: string): Promise<T> {
  const db = admin.firestore();
  return db
    .doc(path)
    .get()
    .then(doc => ({ id: doc.id, ...doc.data() as T}));
}

export function getCollectionRef<T>(path: string): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
  const db = admin.firestore();
  return db
    .collection(path)
    .get();
}

export function getCollection<T>(path: string): Promise<T[]> {
  return getCollectionRef(path).then(collection => collection.docs.map(doc => ({ id: doc.id, ...doc.data() as T })));
}

export function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.orderBy('__name__').limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject);
  });
}

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query.get()
    .then((snapshot) => {
    // When there are no documents left, we are done
    if (snapshot.size === 0) {
        return 0;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });

    return batch.commit().then(() => {
        return snapshot.size;
    });
    }).then((numDeleted) => {
    if (numDeleted === 0) {
        resolve();
        return;
    }

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject);
    });
    })
    .catch(reject);
}
