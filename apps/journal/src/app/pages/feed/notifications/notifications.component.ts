import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { filter, map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
// import { DiscussionService } from '@strive/discussion/+state/discussion.service';
import { orderBy, where } from '@angular/fire/firestore';

@Component({
  selector: 'journal-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit, OnDestroy {

  lastUnreadIndex: number
  notifications$: Observable<Notification[]>

  private sub: Subscription

  constructor(
    // private dicussion: DiscussionService,
    private notification: NotificationService,
    private seo: SeoService,
    public user: UserService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Notifications - Strive Journal` })

    this.notifications$ = this.user.user$.pipe(
      switchMap(user => user
        ? this.notification.valueChanges([where('type', '==', 'notification'), orderBy('createdAt', 'desc')], { uid: user.uid }).pipe(
          // map(notifications => notifications.map(notification => {
          //   return {
          //     ...notification,
          //     'discussion$': this.dicussion.valueChanges(notification.discussionId)
          //   }
          // }))
        )
        : of([]))
    )

    this.sub = combineLatest([
      this.user.user$.pipe(map(user => user?.uid)),
      this.notifications$.pipe(
        map(notifications => notifications.filter(notification => !notification.isRead)),
        filter(unreadNotifications => !!unreadNotifications.length),
        tap(unreadNotifications => {
          this.lastUnreadIndex = unreadNotifications.length - 1
        }),
        map(unreadNotifications => unreadNotifications.map(notification => notification.id))
      )
    ]).subscribe(([uid, ids]) => {
      if (uid) this.notification.update(ids, { isRead: true }, { params: { uid}})
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }
}