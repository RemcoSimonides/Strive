import * as admin from 'firebase-admin'

export interface ErrorResultResponse {
  error: string
  result: any
}

export function unique<T>(array: T[]) {
  return Array.from(new Set(array))
}

export function toDate<D>(target: admin.firestore.DocumentData): D {
  if (!target) return
  if (typeof target !== 'object') return target
  for (const key in target) {
    const value = target[key]
    if (!value || typeof value !== 'object') continue
    if (!!value['_seconds'] && value['_nanoseconds'] >= 0) {
      try {
        target[key] = value.toDate()
      } catch (_) {
        console.log(`${key} is not a Firebase Timestamp`)
      }
      continue
    }
    toDate(value)
  }
  return target as D
}

export const converter = <T>(factory?: any) => {
  return {
    toFirestore(model: T): T { return model },
    fromFirestore(snap: admin.firestore.QueryDocumentSnapshot<T>, idKey = 'uid') {
      const data = { ...snap.data(), [idKey]: snap.id }
      return factory ? factory(data) : data
    }
  }
}

export function getDocumentSnap(path: string, tx?: FirebaseFirestore.Transaction): Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData>> {
  const db = admin.firestore()
  const ref = db.doc(path)
  return tx ? tx.get(ref) : db.doc(path).get()
}

export function getDocument<T>(path: string, tx?: FirebaseFirestore.Transaction): Promise<T> {
  return getDocumentSnap(path, tx).then(doc => doc.exists ? toDate<T>({ ...doc.data(), id: doc.id }) : undefined)
}

export async function queryDocument<T>(query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, tx?: FirebaseFirestore.Transaction): Promise<T> {
  const snap = tx ? await tx.get(query.limit(1)) : await query.limit(1).get()
  return toDate<T>(snap.docs[0].data())
}

export async function queryDocuments<T>(query: FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, tx?: FirebaseFirestore.Transaction): Promise<T[]> {
  const snap = tx ? await tx.get(query) : await query.get()
  return snap.docs.map(doc => toDate<T>(doc.data()))
}

export function getCollectionRef(path: string): Promise<FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>> {
  const db = admin.firestore()
  return db.collection(path).get()
}

export function getCollection<T>(path: string): Promise<T[]> {
  return getCollectionRef(path).then(collection => collection.docs.map(doc => doc.exists ? toDate<T>({ ...doc.data(), id: doc.id }) : undefined))
}

export function deleteCollection(db, collectionPath, batchSize) {
  const collectionRef = db.collection(collectionPath)
  const query = collectionRef.orderBy('__name__').limit(batchSize)

  return new Promise((resolve, reject) => {
    deleteQueryBatch(db, query, batchSize, resolve, reject)
  })
}

function deleteQueryBatch(db, query, batchSize, resolve, reject) {
  query.get()
    .then((snapshot) => {
    // When there are no documents left, we are done
    if (snapshot.size === 0) {
        return 0
    }

    // Delete documents in a batch
    const batch = db.batch()
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref)
    })

    return batch.commit().then(() => {
        return snapshot.size
    })
    }).then((numDeleted) => {
    if (numDeleted === 0) {
        resolve()
        return
    }

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, batchSize, resolve, reject)
    })
    })
    .catch(reject)
}
