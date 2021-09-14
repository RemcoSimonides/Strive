import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { collection, CollectionReference, collectionSnapshots, DocumentData, Firestore, limit, orderBy, Query, query, startAfter } from '@angular/fire/firestore';
import { scan, tap, take } from 'rxjs/operators';
import { createComment } from './comment.firestore';

// Options to reproduce firestore queries consistently
interface QueryConfig {
  path: string, // path to collection
  field: string, // field to orderBy
  limit?: number, // limit per query
  reverse?: boolean, // reverse order?
  prepend?: boolean // prepend to source?
}

@Injectable({
  providedIn: 'root'
})
export class DiscussionPaginationService {

    subscription: Subscription

    // Source data
    private _done = new BehaviorSubject(false);
    private _loading = new BehaviorSubject(false);
    private _data = new BehaviorSubject([]);
    private _cursor

    private query: QueryConfig;
  
    // Observable data
    updates: Observable<any>
    data: Observable<any>;
    done: Observable<boolean> = this._done.asObservable()
    loading: Observable<boolean> = this._loading.asObservable()
  
    constructor(private db: Firestore) {}

    listenToUpdates() {
      const ref = collection(this.db, this.query.path)
      const constraints = [orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc'), limit(1)]
      const _query = query(ref, ...constraints)

      this.subscription = collectionSnapshots(_query).pipe(
        tap(docs => {
          let values = docs.map(doc => {
            const data = createComment(doc.data())
            const id = doc.id
            return { ...data, doc, id, append: true }
          })
          this._data.next(values)
        })
      ).subscribe()
    }
  
    // Initial query sets options and defines the Observable
    init(path, field, opts?) {
      this.query = { 
        path,
        field,
        limit: 5,
        reverse: false,
        prepend: false,
        ...opts
      }
  
      const ref = collection(this.db, this.query.path)
      const constraints = [orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc'), limit(this.query.limit)]
      const first = query(ref, ...constraints)
  
      this.mapAndUpdate(first)
  
      // Create the observable array for consumption in components
      this.data = this._data.asObservable().pipe(
        scan( (acc, val) => {
          if (val.length > 0) {

            if (val.length === 1 && val[0].append) { // New documents need to be added to the end of the array
              const found = acc.some(x => x.id === val[0].id)
              if (!found && val[0].createdAt) {
                return acc.concat(val)
              } else {
                return acc
              }
            } else {
              // set cursor
              this._cursor = this.query.prepend ? val[0].doc : acc[acc.length - 1].doc
              return this.query.prepend ? val.concat(acc) : acc.concat(val)
            }

          } else {
            return []
          }
        })
      )

    }
  
    // Retrieves additional data from firestore
    more() {
      const ref = collection(this.db, this.query.path)
      const constraints = [
        orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc'),
        limit(this.query.limit),
        startAfter(this._cursor)
      ]
      this.mapAndUpdate(query(ref, ...constraints))
    }  
  
    // Maps the snapshot to usable format the updates source
    private mapAndUpdate(col: Query<DocumentData>) {

      if (this._done.value || this._loading.value) { return };
  
      // loading
      this._loading.next(true)
  
      // Map snapshot with doc ref (needed for cursor)
      return collectionSnapshots(col).pipe(
        tap(docs => {
          let values = docs.map(doc => {
            const data = doc.data()
            const id = doc.id
            return { ...data, doc, id }
          })

          // If prepending, reverse array
          values = this.query.prepend ? values.reverse() : values
  
          // update source with new values, done loading
          if (values.length) {
            this._data.next(values)
          }
          this._loading.next(false)
  
          // no more values, mark done
          if (!values.length) {
            this._done.next(true)
          }
        }),
        take(1)
      ).subscribe()
  
    }
  
    // Reset the page
    reset() {
      this.subscription.unsubscribe()
      this._data.next([])
      this._done.next(false)
    }
}
