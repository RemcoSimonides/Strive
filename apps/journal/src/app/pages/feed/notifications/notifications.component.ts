import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { switchMap, tap } from 'rxjs/operators';
import { Observable, of, Subscription } from 'rxjs';
import { orderBy } from '@angular/fire/firestore';
import { PersonalService } from '@strive/user/user/+state/personal.service';

@Component({
  selector: 'journal-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit, OnDestroy {

  lastUnreadIndex: number
  notifications$: Observable<Notification[]>

  private sub: Subscription

  constructor(
    private notification: NotificationService,
    private seo: SeoService,
    public user: UserService,
    private personal: PersonalService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Notifications - Strive Journal` })

    this.notifications$ = this.user.user$.pipe(
      tap(_ => this.personal.updateLastCheckedNotification()),
      switchMap(user => user
        ? this.notification.valueChanges([orderBy('createdAt', 'desc')], { uid: user.uid })
        : of([]))
    )

    // this.sub = combineLatest([
    //   this.user.user$.pipe(map(user => user?.uid)),
    //   this.notifications$.pipe(
    //     map(notifications => notifications.filter(notification => !notification.isRead)),
    //     filter(unreadNotifications => !!unreadNotifications.length),
    //     tap(unreadNotifications => {
    //       this.lastUnreadIndex = unreadNotifications.length - 1
    //     }),
    //     map(unreadNotifications => unreadNotifications.map(notification => notification.id))
    //   )
    // ]).subscribe(([uid, ids]) => {
    //   if (uid) this.notification.update(ids, { isRead: true }, { params: { uid}})
    // })
  }

  ngOnDestroy() {
    // this.sub.unsubscribe()
  }
}