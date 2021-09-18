import { Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { filter, map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable, of, Subscription } from 'rxjs';
import { DiscussionService } from '@strive/discussion/+state/discussion.service';
import { orderBy, where } from '@angular/fire/firestore';

@Component({
  selector: 'strive-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notifications.component.scss']
})
export class NotificationsPage implements OnInit, OnDestroy {

  notifications$: Observable<Notification[]>

  sub: Subscription

  constructor(
    private dicussion: DiscussionService,
    private notification: NotificationService,
    private seo: SeoService,
    public user: UserService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Notifications - Strive Journal` })

    // const date = new Date();
    // date.setDate(date.getDate() - 14);

    this.notifications$ = this.user.profile$.pipe(
      switchMap(profile => profile
        ? this.notification.valueChanges([where('type', '==', 'notification'), orderBy('createdAt', 'desc')], { uid: profile.uid }).pipe(
          map(notifications => notifications.map(notification => {
            return {
              ...notification,
              'discussion$': this.dicussion.valueChanges(notification.discussionId)
            }
          }))
        )
        : of([]))
    )

    this.sub = combineLatest([
      this.user.profile$.pipe(map(profile => profile?.uid)),
      this.notifications$.pipe(
        map(notifications => notifications.filter(notification => !notification.isRead)),
        filter(unreadNotifications => !!unreadNotifications.length),
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