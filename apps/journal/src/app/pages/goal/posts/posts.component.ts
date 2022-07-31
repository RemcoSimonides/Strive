import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Firestore, collection, where, orderBy, limit, query, Query, getDocs, startAfter } from '@angular/fire/firestore';
import { DocumentData, endBefore, QueryConstraint } from 'firebase/firestore';

import { BehaviorSubject, of, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { delay, toDate } from '@strive/utils/helpers';

import { createGoalEvent, Goal, GoalEvent } from '@strive/goal/goal/+state/goal.firestore';
import { PostService } from '@strive/post/+state/post.service';
import { GoalEventService } from '@strive/notification/+state/goal-events.service';

@Component({
  selector: '[goal] journal-goal-posts',
  templateUrl: 'posts.component.html',
  styleUrls: ['./posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostsComponent implements OnInit, OnDestroy {
  private postsPerQuery = 40
  private query: Query<DocumentData>
  private sub: Subscription

  private _events = new BehaviorSubject<GoalEvent[]>([])
  private _done = new BehaviorSubject<boolean>(false)
  private _loading = new BehaviorSubject<boolean>(false)

  events$ = this._events.asObservable()

  hasSyncingPosts = false

  @Input() goal: Goal
  @Input() set isAdmin(isAdmin: boolean) {
    if (isAdmin && this.goal) {
      this.sub = this.post.getSyncingPosts$(this.goal.id).pipe(
        tap(ids => {
          if (ids.length) {
            this.hasSyncingPosts = true
            this.cdr.markForCheck()
          }
        }),
        switchMap(ids => ids.length ? this.events.valueChanges(ids) : of([]))
      ).subscribe(events => {
        const ids = events.map(event => event.id)
        if (ids.length) {
          this.refreshPosts()
          const remaining = this.post.updateSyncingPosts(ids, this.goal.id)
          if (!remaining.length) {
            this.hasSyncingPosts = false
            this.cdr.markForCheck()
          }
        }
      })
    }
  }

  constructor(
    private cdr: ChangeDetectorRef,
    private db: Firestore,
    private events: GoalEventService,
    private post: PostService
  ) {}

  ngOnInit() {
    const ref = collection(this.db, `GoalEvents`)
    const constraints = [
      where('source.goal.id', '==', this.goal.id),
      orderBy('createdAt', 'desc'),
      limit(this.postsPerQuery)
    ]
    this.query = query(ref, ...constraints)
    this.mapAndUpdate([])
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }

  private async mapAndUpdate(queryConstraints: QueryConstraint[], isRefresh = false) {
    if (!isRefresh && (this._done.value || this._loading.value)) return
    this._loading.next(true)

    const snapshot = await getDocs(query(this.query, ...queryConstraints))
    if (!snapshot.empty) {
      const posts = snapshot.docs.map(doc => createGoalEvent(toDate({ ...doc.data(), id: doc.id })))
      const next = isRefresh ? [...posts, ...this._events.value] : [...this._events.value, ...posts]
      this._events.next(next)
    }
    if (!isRefresh && (snapshot.empty || snapshot.size < this.postsPerQuery)) this._done.next(true)
    this._loading.next(false)
  }

  async more($event) {
    const events = this._events.value
    const cursor = events[events.length - 1].createdAt ?? null

    await Promise.race([
      delay(5000),
      this.mapAndUpdate([startAfter(cursor)])
    ])

    $event.target.complete()
    if (this._done.value) {
      $event.target.disabled = true
    }
  }

  async refreshPosts($event?) {
    const cursor = this._events.value[0]?.createdAt ?? null
    await Promise.race([
      delay(5000),
      this.mapAndUpdate([endBefore(cursor)], true).then(() => delay(500))
    ])
    $event?.target.complete()
  }
}