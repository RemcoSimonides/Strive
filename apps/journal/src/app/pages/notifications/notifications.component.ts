import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { SeoService } from '@strive/utils/services/seo.service';
import { NotificationService } from '@strive/notification/notification.service';
import { Notification, notificationEvents } from '@strive/model'
import { UserService } from '@strive/user/user/user.service';
import { switchMap, tap, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { orderBy } from '@angular/fire/firestore';
import { PersonalService } from '@strive/user/user/personal.service';

@Component({
  selector: 'journal-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {

  notifications$: Observable<Notification[]>

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
      switchMap(user => {
        if (!user) return of([])
        return this.notification.valueChanges([orderBy('createdAt', 'desc')], { uid: user.uid }).pipe(
          map(notifications => notifications.filter(n => notificationEvents.includes(n.event)))
        )
      })
    )
  }
}