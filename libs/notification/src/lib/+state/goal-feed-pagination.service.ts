import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { Firestore, collection, where, orderBy, limit, query, collectionSnapshots, Query, startAfter } from '@angular/fire/firestore';
import { scan, tap, take, map } from 'rxjs/operators';
import { Notification } from './notification.firestore';
import { DiscussionService } from '@strive/discussion/+state/discussion.service';
import { createNotification } from './notification.model';


@Injectable({
  providedIn: 'root'
})
export class GoalFeedPaginationService {

  subscription: Subscription

  // Source data
  private _done = new BehaviorSubject(false);
  private _loading = new BehaviorSubject(false);
  private _data = new BehaviorSubject([]);
  private _refreshing = new BehaviorSubject(false);

  private path: string;

  // Observable data
  data: Observable<any>;
  done$: Observable<boolean> = this._done.asObservable();
  loading$: Observable<boolean> = this._loading.asObservable();
  refreshing$: Observable<boolean> = this._refreshing.asObservable();

  discussionIds: string[] = []

  constructor(
    private db: Firestore,
    private discussion: DiscussionService
  ) {}

  get done() { return this._done.value }

  listenToUpdates() {
    const ref = collection(this.db, this.path)
    const constraints = [where('type', '==', 'feed'), orderBy('createdAt', 'desc'), limit(1)]
    const updates = query(ref, ...constraints)

    this.subscription = collectionSnapshots(updates).pipe(
      tap(docs => {
        const values = docs.map(doc => {
          const data = createNotification(doc.data())
          const id = doc.id
          return { ...data, doc, id, append: true }
        })
        this._data.next(values)
      })
    ).subscribe()
  }

  /**
   * Initial query sets options and defines the Observable
   * @param path path to collection
   * @param field field to orderBy
   * @param limit limit per query
   */
  init(path: string) {
    this.path = path
    const ref = collection(this.db, this.path)
    const constraints = [where('type', '==', 'feed'), orderBy('createdAt', 'desc'), limit(20)]
    this.mapAndUpdate(query(ref, ...constraints))

    // Create the observable array for consumption in components
    this.data = this._data.asObservable().pipe(
      scan((acc, val) => {
        if (val.length) {
          if (val.length === 1 && val[0].append) {
            const found = acc.some(notification => notification.id === val[0].id)
            if (!found && val[0].createdAt) {
              acc.unshift(val[0])
              return acc
            } else {
              return acc
            }
          } else {
            const array = acc.concat(val)
            const uniqueArrray = this.getUnique(array, 'id')
            const orderedArray = uniqueArrray.sort((a, b) => (a.createdAt.seconds > b.createdAt.seconds) ? -1 : 1)
            return orderedArray
          }
        } else {
          return acc
        }
      })
    )
  }

  // Retrieves additional data from firestore
  more() {
    const cursor = this.getCursor()
    const ref = collection(this.db, this.path)
    const constraints = [where('type', '==', 'feed'), orderBy('createdAt', 'desc'), limit(20), startAfter(cursor.createdAt)]
    this.mapAndUpdate(query(ref, ...constraints))
  }

  // Determines the doc snapshot to paginate query 
  private getCursor() {
    const current = this._data.value
    return current.length ? current[current.length - 1] : null
  }

  // Maps the snapshot to usable format the updates source
  private mapAndUpdate(query: Query) {
    if (this._done.value || this._loading.value) return
    this._loading.next(true)

    // Map snapshot with doc ref (needed for cursor)
    return collectionSnapshots(query).pipe(
      map(docs => docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          'discussion$': this.discussion.valueChanges(data.discussionId)
        }
      })),
      tap(arr => {
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
  refresh(path: string) {
    this.subscription.unsubscribe();
    this._refreshing.next(true)
    this.reset()
    this.init(path)
    this.listenToUpdates()
  }

  private getUnique(arr: Notification[], comp: string) {
    return arr.map(e => e[comp])
       // store the keys of the unique objects
      .map((e, i, final) => final.indexOf(e) === i && i)
      // eliminate the dead keys & store unique objects
      .filter(e => arr[e]).map(e => arr[e]);
  }
  
}