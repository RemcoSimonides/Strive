import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { orderBy } from '@firebase/firestore'
import { joinWith } from 'ngfire'

import { switchMap, tap, map } from 'rxjs/operators'
import { Observable, of } from 'rxjs'

import { Notification, notificationEvents } from '@strive/model'

import { SeoService } from '@strive/utils/services/seo.service'
import { NotificationService } from '@strive/notification/notification.service'
import { PersonalService } from '@strive/user/personal.service'
import { GoalService } from '@strive/goal/goal.service'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { SupportService } from '@strive/support/support.service'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'
import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'

@Component({
  selector: 'journal-notifications',
  templateUrl: 'notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationsComponent implements OnInit {

  notifications$?: Observable<Notification[]>
  uid$ = this.auth.uid$

  constructor(
    private auth: AuthService,
    private goalService: GoalService,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private notification: NotificationService,
    private seo: SeoService,
    private supportService: SupportService,
    private personal: PersonalService,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.seo.generateTags({ title: `Notifications - Strive Journal` })

    this.notifications$ = this.auth.profile$.pipe(
      tap(_ => this.personal.updateLastCheckedNotification()),
      switchMap(profile => {
        if (!profile) return of([])
        return this.notification.valueChanges([orderBy('createdAt', 'desc')], { uid: profile.uid }).pipe(
          map(notifications => notifications.filter(n => notificationEvents.includes(n.event)))
        )
      }),
      joinWith({
        goal: ({ goalId }) => goalId ? this.goalService.valueChanges(goalId) : of(undefined),
        milestone: ({ milestoneId, goalId }) => milestoneId && goalId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        support: ({ supportId, goalId }) => supportId && goalId ? this.supportService.valueChanges(supportId, { goalId }) : of(undefined),
        user: ({ userId }) => userId ? this.profileService.valueChanges(userId) : of(undefined)
      }, { shouldAwait: true })
    )
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }
}