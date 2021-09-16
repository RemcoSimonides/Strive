import { Injectable } from '@angular/core';
import { 
  Firestore,
  serverTimestamp,
  doc,
  collection,
  CollectionReference,
  QueryConstraint,
  query,
  Query,
  DocumentReference,
  collectionGroup,
  docSnapshots,
  collectionSnapshots,
  getDoc,
  updateDoc,
  setDoc,
  addDoc
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'

function typedDocument<T>(firestore: Firestore, path: string): DocumentReference<T> {
  return doc(firestore, path) as DocumentReference<T>
}
function typedCollection<T>(firestore: Firestore, path: string): CollectionReference<T> {
  return collection(firestore, path) as CollectionReference<T>
}
function typedCollectionGroup<T>(firestore: Firestore, path: string): Query<T> {
  return collectionGroup(firestore, path) as Query<T>
}

/**
 * CODE FROM: https://angularfirebase.com/lessons/firestore-advanced-usage-angularfire/
 */
 
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private afs: Firestore) { }

  getNewId() {
    return doc(collection(this.afs, 'createNewId')).id;
  }

  /**
   * Reference to collection
   * @param ref Reference to collection
   * @param queryFn query (filter/order)
   * @returns reference 
   */
  col<T>(ref: Query<T> | string, queryConstraints: QueryConstraint[] = []): Query<T> {
    const typedRef = typeof ref === 'string' ? typedCollection<T>(this.afs, ref) : ref
    return typeof ref === 'string' ? query(typedRef, ...queryConstraints) : ref;
  }

  collectionGroup<T>(ref: Query<T> | string, queryConstraints: QueryConstraint[] = []): Query<T> {
    return typeof ref === 'string' ? query(typedCollectionGroup<T>(this.afs, ref), ...queryConstraints) : null;
  }

  /**
   * Reference to document
   * @param ref Referenc to document
   * @returns Reference
   */
  doc<T>(ref: DocumentReference<T> | string): DocumentReference<T> {
    return typeof ref === 'string' ? typedDocument<T>(this.afs, ref) : ref;
  }

  /**
   * Reference to document and returns an observable of the document
   * @param ref Reference to document
   * @returns observable of the document
   */
  doc$<T>(ref: DocumentReference<T> | string): Observable<T> {
    return docSnapshots(this.doc(ref)).pipe(map(doc => doc.data()))
  }

  docWithId$<T>(ref: DocumentReference<T> | string): Observable<T> {
    return docSnapshots(this.doc(ref)).pipe(
      map(doc => {
        const data = doc.data()
        const id = doc.id
        return { id, ...data }
      })
    )
  }

  /**
   * Reference to collection and returns an observable of the collection
   * @param ref Reference to collection
   * @param queryFn query (filter/order)
   * @returns Observable of collection
   */
  col$<T>(ref: CollectionReference<T> | string, queryConstraints: QueryConstraint[] = []): Observable<T[]> {
    return collectionSnapshots(this.col(ref, queryConstraints))
      .pipe(map(docs => docs.map(a => a.data()))
    )
  }

  /**
   * Reference to collection and returns and observable of the collection including its ID
   * @param ref Reference to collection
   * @param queryFn query (filter/order)
   * @returns Observable of collection including its ID
   */
  colWithIds$<T>(ref: CollectionReference<T> | string, queryConstraints: QueryConstraint[] = []): Observable<T[]> {
    return collectionSnapshots(this.col(ref, queryConstraints))
      .pipe(
        map(docs => {
          return docs.map(doc => {
            const data = doc.data()
            const id = doc.id
            return { id, ...data }
          })
        })
      )
  }

  collectionGroupWithIds$<T>(ref: CollectionReference<T> | string, queryConstraints: QueryConstraint[] = []): Observable<T[]> {
    return collectionSnapshots(this.collectionGroup(ref, queryConstraints))
      .pipe(
        map(docs => {
          return docs.map(doc => {
            const data = doc.data()
            const id = doc.id
            return { id, ...data }
          })
        })
      )

  }
  /**
   * Either updates or sets the document depending on whether the doc exists
   * @param ref Reference to document
   * @param data Object with the new data
   */
  upsert<T>(ref: DocumentReference<T> | string, data: any) {
    return getDoc(this.doc(ref)).then(doc => {
      return doc.exists() ? this.update(ref, data) : this.set(ref, data)
    })
  }

  /**
   * Updates a document with the new data (auto adds timestamps)
   * @param ref Reference to document
   * @param data Object with the new data
   */
  update<T>(ref: DocumentReference<T> | string, data: any) {
    return updateDoc(this.doc(ref), {
      ...data,
      updatedAt: serverTimestamp()
    })
  }

  /**
   * Sets a new document (auto adds timestamps)
   * @param ref Reference to to-be-made document
   * @param data Object with the new data
   */
  set<T>(ref: DocumentReference<T> | string, data: any) {
    const timestamp = serverTimestamp()

    return setDoc(this.doc(ref), {
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }

  /**
   * Adds document to collection
   * @param ref Reference to collection
   * @param data Object with the new data
   */
  add<T>(ref: CollectionReference<T> | string, data: any) {
    const timestamp = serverTimestamp()
    const _ref = typeof ref === 'string' ? typedCollection<T>(this.afs, ref) : ref;
    return addDoc(_ref, {
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }

}