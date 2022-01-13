import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Firestore, collection, where, orderBy, limit, query, Query, getDocs, startAfter } from '@angular/fire/firestore';
import { DocumentData, endBefore, QueryConstraint } from 'firebase/firestore';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, scan, switchMap } from 'rxjs/operators';
import { delay } from '@strive/utils/helpers';

import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { DiscussionService } from '@strive/discussion/+state/discussion.service';

import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { createGoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { createNotification } from '@strive/notification/+state/notification.model';

@Component({
  selector: '[goal] journal-goal-posts',
  templateUrl: 'posts.component.html',
  styleUrls: ['./posts.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PostsComponent implements OnInit {
  private postsPerQuery = 20
  private query: Query<DocumentData>

  private _posts = new BehaviorSubject<Notification[]>([])
  private _done = new BehaviorSubject<boolean>(false)
  private _loading = new BehaviorSubject<boolean>(false)

  posts$ = this._posts.asObservable().pipe(
    scan((acc, val) => acc.concat(val))
  )

  isAdmin$: Observable<boolean>

  @Input() goal: Goal

  constructor(
    private db: Firestore,
    private discussion: DiscussionService,
    private user: UserService,
    private stakeholder: GoalStakeholderService
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

    this.isAdmin$ = this.user.user$.pipe(
      switchMap(user => user
        ? this.stakeholder.valueChanges(user.uid, { goalId: this.goal.id })
        : of(undefined)),
      map(stakeholder => createGoalStakeholder(stakeholder).isAdmin)
    )
  }

  private async mapAndUpdate(queryConstraints: QueryConstraint[]) {
    if (this._done.value || this._loading.value) return
    this._loading.next(true)

    const snapshot = await getDocs(query(this.query, ...queryConstraints))
    if (!snapshot.empty) {
      const posts = snapshot.docs.map(doc => {
        const data = createNotification({ ...doc.data(), id: doc.id })
        return { ...data, 'discussion$': this.discussion.valueChanges(data.discussionId) }
      })
      this._posts.next(posts)
    }
    if (snapshot.empty || snapshot.size < this.postsPerQuery) this._done.next(true)
    this._loading.next(false)
  }

  async more($event) {
    const cursor = this._posts.value.pop()?.createdAt ?? null

    await Promise.race([
      delay(5000),
      this.mapAndUpdate([startAfter(cursor)])
    ])

    $event.target.complete()
    if (this._done.value) {
      $event.target.disabled = true
    }
  }

  async refreshPosts($event) {
    const cursor = this._posts.value[0]?.createdAt ?? null
    await Promise.race([
      delay(5000),
      this.mapAndUpdate([endBefore(cursor)]).then(() => delay(500))
    ])

    $event.target.complete()
  }
}