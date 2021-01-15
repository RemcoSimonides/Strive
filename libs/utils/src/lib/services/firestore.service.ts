import { Injectable } from '@angular/core';
import firebase from 'firebase/app';
import { AngularFirestore, AngularFirestoreCollection, AngularFirestoreDocument, AngularFirestoreCollectionGroup, QueryFn, DocumentSnapshot, Action, DocumentSnapshotExists, QueryDocumentSnapshot } from '@angular/fire/firestore'
import { Observable } from 'rxjs';
import { take, tap, map } from 'rxjs/operators'
import { FieldValue } from '@firebase/firestore-types';

// types
type CollectionPredicate<T> = string | AngularFirestoreCollection<T>;
type DocPredicate<T> = string | AngularFirestoreDocument<T>;

/**
 * CODE FROM: https://angularfirebase.com/lessons/firestore-advanced-usage-angularfire/
 */
 
@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private afs: AngularFirestore) { }

  get timestamp(): FieldValue {
    return firebase.firestore.FieldValue.serverTimestamp();
  }

  getArrayUnion(value): FieldValue {
    return firebase.firestore.FieldValue.arrayUnion(value)
  }

  async getNewId(): Promise<string> {
    return await this.afs.createId();
  }

  /**
   * Reference to collection
   * @param ref Reference to collection
   * @param queryFn query (filter/order)
   * @returns reference 
   */
  col<T>(ref: CollectionPredicate<T>, queryFn?: any): AngularFirestoreCollection<T> {
    return typeof ref === 'string' ? this.afs.collection<T>(ref, queryFn) : ref;
  }

  collectionGroup<T>(ref: CollectionPredicate<T>, queryFn?: any): AngularFirestoreCollectionGroup<T> {
    return typeof ref === 'string' ? this.afs.collectionGroup<T>(ref, queryFn) : null
  }

  /**
   * Reference to document
   * @param ref Referenc to document
   * @returns Reference
   */
  doc<T>(ref: DocPredicate<T>): AngularFirestoreDocument<T> {
    return typeof ref === 'string' ? this.afs.doc<T>(ref) : ref;
  }

  /**
   * Reference to document and returns an observable of the document
   * @param ref Reference to document
   * @returns observable of the document
   */
  doc$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.doc(ref).snapshotChanges()
      .pipe(
        map(doc => {
          return doc.payload.data() as T;
        })
      )
  }

  docWithId$<T>(ref: DocPredicate<T>): Observable<T> {
    return this.doc(ref).snapshotChanges()
      .pipe(
        map(doc => {
          const data: any = doc.payload.data()
          const id = doc.payload.id
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
  col$<T>(ref: CollectionPredicate<T>, queryFn?: QueryFn): Observable<T[]> {
    return this.col(ref, queryFn).snapshotChanges()
      .pipe(
        map(docs => {
          return docs.map(a => a.payload.doc.data() as T)
        })
      )

  }

  /**
   * Reference to collection and returns and observable of the collection including its ID
   * @param ref Reference to collection
   * @param queryFn query (filter/order)
   * @returns Observable of collection including its ID
   */
  colWithIds$<T>(ref: CollectionPredicate<T>, queryFn?: QueryFn): Observable<any[]> {
    return this.col(ref, queryFn).snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data: any = a.payload.doc.data()
            const id = a.payload.doc.id
            return { id, ...data }
          })
        })
      )
  }

  collectionGroupWithIds$<T>(ref: CollectionPredicate<T>, queryFn?: QueryFn): Observable<any[]> {

    return this.collectionGroup(ref, queryFn).snapshotChanges()
      .pipe(
        map(actions => {
          return actions.map(a => {
            const data: any = a.payload.doc.data()
            const id = a.payload.doc.id
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
  upsert<T>(ref: DocPredicate<T>, data: any) {
    const doc = this.doc(ref).snapshotChanges().pipe(take(1)).toPromise()
  
    return doc.then(snap => {
      return snap.payload.exists ? this.update(ref, data) : this.set(ref, data)
    })
  }

  /**
   * Updates a document with the new data (auto adds timestamps)
   * @param ref Reference to document
   * @param data Object with the new data
   */
  update<T>(ref: DocPredicate<T>, data: any) {
    return this.doc(ref).update({
      ...data,
      updatedAt: this.timestamp
    })
  }

  /**
   * Sets a new document (auto adds timestamps)
   * @param ref Reference to to-be-made document
   * @param data Object with the new data
   */
  set<T>(ref: DocPredicate<T>, data: any) {
    const timestamp = this.timestamp

    return this.doc(ref).set({
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
  add<T>(ref: CollectionPredicate<T>, data: any) {
    const timestamp = this.timestamp
    return this.col(ref).add({
      ...data,
      updatedAt: timestamp,
      createdAt: timestamp
    })
  }

  /**
   * used to test a query
   * @param ref 
   */
  inspectDoc(ref: DocPredicate<any>): void {
    const tick = new Date().getTime()
    this.doc(ref)
        .snapshotChanges()
        .pipe(
          take(1),
          tap(d => {
            const tock = new Date().getTime() - tick
            console.log(`Loaded Document in ${tock}ms`, d.payload.data())
          })
        )
        .subscribe()
  }

  /**
   * Used to test a query
   * @param ref 
   */
  inspectCol(ref: CollectionPredicate<any>): void {
    const tick = new Date().getTime()
    this.col(ref)
        .snapshotChanges()
        .pipe(
          take(1),
          tap(c => {
          const tock = new Date().getTime() - tick
          console.log(`Loaded Collection in ${tock}ms`, c)
        })
        )
        .subscribe()
  }

}