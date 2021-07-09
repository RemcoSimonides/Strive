import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';
import { NotificationService } from '@strive/notification/+state/notification.service';
import { Notification } from '@strive/notification/+state/notification.firestore';
import { UserService } from '@strive/user/user/+state/user.service';
import { distinctUntilChanged, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'strive-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsPage implements OnInit {

  decisions$: Observable<Notification[]>
  notifications$: Observable<Notification[]>

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
  }
}