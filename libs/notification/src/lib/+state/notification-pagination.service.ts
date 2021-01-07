import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { scan, tap, take } from 'rxjs/operators';
import { leftJoin } from '@strive/utils/leftJoin';

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
export class NotificationPaginationService {

  // Source data
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  private _data = new BehaviorSubject([]);
  private _refreshing = new BehaviorSubject(false);

  private query: QueryConfig;

  // Observable data
  data: Observable<any>;
  done: Observable<boolean> = this._done.asObservable();
  loading: Observable<boolean> = this._loading.asObservable();
  refreshing: Observable<boolean> = this._refreshing.asObservable();

  discussionIds: string[] = []

  constructor(private afs: AngularFirestore) {}

  // Initial query sets options and defines the Observable
  init(path, field, opts?) {
    this.query = { 
      path,
      field,
      limit: 20,
      reverse: false,
      prepend: false,
      ...opts
    }

    const firstNotifications = this.afs.collection(this.query.path, ref => ref.orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc').limit(this.query.limit))

    this.mapAndUpdate(firstNotifications)

    // Create the observable array for consumption in components
    this.data = this._data.asObservable().pipe(
      scan( (acc, val) => { 
        const array = this.query.prepend ? val.concat(acc) : acc.concat(val)
        const uniqueArrray = this.getUnique(array, 'id')
        // order by created At
        const orderedArray = uniqueArrray.sort((a, b) => (a.createdAt.seconds > b.createdAt.seconds) ? this.query.reverse ? -1 : 1 : this.query.reverse ? 1 : -1)

        return orderedArray

      })
    )

  }

  // Retrieves additional data from firestore
  more() {
    const cursor = this.getCursor()
    const more = this.afs.collection(this.query.path, ref => {
      return ref
              .orderBy(this.query.field, this.query.reverse ? 'desc' : 'asc')
              .limit(this.query.limit)
              .startAfter(cursor.createdAt)
    })
    this.mapAndUpdate(more)
  }

  // Determines the doc snapshot to paginate query 
  private getCursor() {
    const current = this._data.value
    if (current.length) {
      return this.query.prepend ? current[0] : current[current.length - 1]
    }
    return null
  }


  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(col: AngularFirestoreCollection<any>) {

    if (this._done.value || this._loading.value) { return };

    // loading
    this._loading.next(true)

    // Map snapshot with doc ref (needed for cursor)
    return col.snapshotChanges().pipe(
      leftJoin(this.afs, 'discussionId', 'Discussions'),
      tap(arr => {
        // If prepending, reverse array
        arr = this.query.prepend ? arr.reverse() : arr

        // update source with new values, done loading
        this._data.next(arr)
        this._loading.next(false)
        this._refreshing.next(false)

        // no more values, mark done
        if (!arr.length) {
          this._done.next(true)
        }
      }),
      take(1)
    ).subscribe()

  }

  // Reset the page
  reset() {
    this._data.next([])
    this._done.next(false)
    this._loading.next(false)
  }

  // Refresh the page
  refresh(path, field, opts?) {
    this._refreshing.next(true)

    // this.reset()
    this._done.next(false)
    this.init(path, field, opts)
  }

  private getUnique(arr, comp: string) {

    const unique = arr
         .map(e => e[comp])
  
       // store the keys of the unique objects
      .map((e, i, final) => final.indexOf(e) === i && i)
  
      // eliminate the dead keys & store unique objects
      .filter(e => arr[e]).map(e => arr[e]);
  
     return unique;
  }
  
}
