import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { combineLatest, Observable, of, Subscription } from 'rxjs';

@Component({
  selector: 'strive-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPage implements OnInit, OnDestroy {

  decisions$: Observable<Notification[]>
  notifications$: Observable<Notification[]>

  sub: Subscription

  constructor(
    private notification: NotificationService,
    private seo: SeoService,
    private user: UserService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Notifications - Strive Journal` })

    const profile$ = this.user.profile$.pipe(
      distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
    )

    this.decisions$ = profile$.pipe(
      switchMap(profile => profile
        ? this.notification.valueChanges(ref => ref.where('type', 'not-in', ['notification', 'feed']), { uid: profile.id })
        : of([])),
    )

    const date = new Date();
    date.setDate(date.getDate() - 14);

    this.notifications$ = profile$.pipe(
      switchMap(profile => profile
        ? this.notification.valueChanges(ref => ref.where('type', '==', 'notification').where('createdAt', '>=', date).orderBy('createdAt', 'desc'), { uid: profile.id })
        : of([]))
    )

    this.sub = combineLatest([
      profile$.pipe(map(profile => profile.id)),
      this.notifications$.pipe(
        map(notifications => notifications.filter(notification => !notification.isRead)),
        filter(unreadNotifications => !!unreadNotifications.length),
        map(unreadNotifications => unreadNotifications.map(notification => notification.id))
      )
    ]).subscribe(([uid, ids]) => {
      this.notification.update(ids, { isRead: true }, { params: { uid}})
    })
  }

  ngOnDestroy() {
    this.sub.unsubscribe()
  }
}