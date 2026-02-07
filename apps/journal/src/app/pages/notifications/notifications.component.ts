import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core'

import { IonContent, ModalController } from '@ionic/angular/standalone'
import { addIcons } from 'ionicons'
import { chevronUpOutline } from 'ionicons/icons'

import { orderBy } from '@angular/fire/firestore'
import { joinWith } from '@strive/utils/firebase'

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
import { HeaderComponent } from '@strive/ui/header/header.component'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { MessagePipe } from '@strive/notification/pipes/message.pipe'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { TimeAgoPipe } from '@strive/utils/pipes/time-ago.pipe'


@Component({
    selector: 'journal-notifications',
    templateUrl: 'notifications.component.html',
    styleUrls: ['./notifications.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        HeaderComponent,
        PageLoadingComponent,
        MessagePipe,
        ImageDirective,
        TimeAgoPipe,
        IonContent
    ]
})
export class NotificationsPageComponent implements OnInit {
  private auth = inject(AuthService);
  private goalService = inject(GoalService);
  private milestoneService = inject(MilestoneService);
  private modalCtrl = inject(ModalController);
  private notification = inject(NotificationService);
  private seo = inject(SeoService);
  private supportService = inject(SupportService);
  private personal = inject(PersonalService);
  private profileService = inject(ProfileService);


  notifications$?: Observable<Notification[]>
  uid = this.auth.uid

  constructor() {
    addIcons({ chevronUpOutline });
  }

  ngOnInit() {
    this.seo.generateTags({ title: `Notifications - Strive Journal` })

    this.notifications$ = this.auth.profile$.pipe(
      tap(() => this.personal.updateLastCheckedNotification()),
      switchMap(profile => {
        if (!profile) return of([])
        return this.notification.collectionData([orderBy('createdAt', 'desc')], { uid: profile.uid }).pipe(
          map(notifications => notifications.filter(n => notificationEvents.includes(n.event)))
        )
      }),
      joinWith({
        goal: ({ goalId }) => goalId ? this.goalService.docData(goalId) : of(undefined),
        milestone: ({ milestoneId, goalId }) => milestoneId && goalId ? this.milestoneService.docData(milestoneId, { goalId }) : of(undefined),
        support: ({ supportId, goalId }) => supportId && goalId ? this.supportService.docData(supportId, { goalId }) : of(undefined),
        user: ({ userId }) => userId ? this.profileService.docData(userId) : of(undefined)
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
