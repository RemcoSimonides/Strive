import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'

import { orderBy } from '@firebase/firestore'

import { switchMap, tap, map } from 'rxjs/operators'
import { Observable, of } from 'rxjs'

import { Notification, notificationEvents } from '@strive/model'

import { SeoService } from '@strive/utils/services/seo.service'
import { NotificationService } from '@strive/notification/notification.service'
import { UserService } from '@strive/user/user/user.service'
import { PersonalService } from '@strive/user/personal/personal.service'
import { GoalService } from '@strive/goal/goal/goal.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { SupportService } from '@strive/support/support.service'
import { joinWith } from 'ngfire'

@Component({
  selector: 'journal-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {

  notifications$?: Observable<Notification[]>

  constructor(
    private goalService: GoalService,
    private milestoneService: MilestoneService,
    private notification: NotificationService,
    private seo: SeoService,
    private supportService: SupportService,
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
      }),
      joinWith({
        goal: ({ goalId }) => goalId ? this.goalService.valueChanges(goalId) : of(undefined),
        milestone: ({ milestoneId, goalId }) => milestoneId && goalId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        support: ({ supportId, goalId }) => supportId && goalId ? this.supportService.valueChanges(supportId, { goalId }) : of(undefined),
        user: ({ userId }) => userId ? this.user.valueChanges(userId) : of(undefined)
      }, { shouldAwait: true })
    )
  }
}