import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Firestore, collection, where, orderBy, limit, query, Query, getDocs, startAfter } from '@angular/fire/firestore';
import { DocumentData, endBefore, QueryConstraint } from 'firebase/firestore';

import { BehaviorSubject, of, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { delay } from '@strive/utils/helpers';

import { DiscussionService } from '@strive/discussion/+state/discussion.service';

import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { createNotification } from '@strive/notification/+state/notification.model';
import { PostService } from '@strive/post/+state/post.service';
import { GoalNotificationService } from '@strive/notification/+state/goal-notification.service';

@Component({
  selector: '[goal] journal-goal-posts',
  templateUrl: 'posts.component.html',
  styleUrls: ['./posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostsComponent implements OnInit, OnDestroy {
  private postsPerQuery = 20
  private query: Query<DocumentData>
  private sub: Subscription

  private _notifications = new BehaviorSubject<Notification[]>([])
  private _done = new BehaviorSubject<boolean>(false)
  private _loading = new BehaviorSubject<boolean>(false)

  notifications$ = this._notifications.asObservable()

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
        switchMap(ids => ids.length
          ? this.goalNotification.valueChanges(ids, { goalId: this.goal.id })
          : of([]))
      ).subscribe(notifications => {
        const ids = notifications.map(notification => notification.id)
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
    private discussion: DiscussionService,
    private goalNotification: GoalNotificationService,
    private post: PostService
  ) {}

  ngOnInit() {
    const ref = collection(this.db, `Goals/${this.goal.id}/Notifications`)
    const constraints = [
      where('type', '==', 'feed'),
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
      const posts = snapshot.docs.map(doc => {
        const data = createNotification({ ...doc.data(), id: doc.id })
        return { ...data, 'discussion$': this.discussion.valueChanges(data.discussionId) }
      })
      const next = isRefresh ? [...posts, ...this._notifications.value] : [...this._notifications.value, ...posts]
      this._notifications.next(next)
    }
    if (!isRefresh && (snapshot.empty || snapshot.size < this.postsPerQuery)) this._done.next(true)
    this._loading.next(false)
  }

  async more($event) {
    const posts = this._notifications.value
    const cursor = posts[posts.length - 1].createdAt ?? null

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
    const cursor = this._notifications.value[0]?.createdAt ?? null
    await Promise.race([
      delay(5000),
      this.mapAndUpdate([endBefore(cursor)], true).then(() => delay(500))
    ])
    $event?.target.complete()
  }
}