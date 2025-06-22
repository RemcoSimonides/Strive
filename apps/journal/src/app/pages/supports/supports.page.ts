import { ChangeDetectionStrategy, Component, inject } from '@angular/core'

import { IonContent, IonRefresher, IonRefresherContent, ModalController, RefresherCustomEvent } from '@ionic/angular/standalone'

import { where } from 'firebase/firestore'
import { joinWith } from 'ngfire'

import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { delay } from '@strive/utils/helpers'
import { groupByObjective, sortGroupedSupports, SupportsGroupedByGoal } from '@strive/model'

import { SeoService } from '@strive/utils/services/seo.service'
import { SupportService } from '@strive/support/support.service'
import { GoalService } from '@strive/goal/goal.service'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/auth/components/auth-modal/auth-modal.page'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { HeaderRootComponent } from '@strive/ui/header-root/header-root.component'
import { SupportListComponent } from '@strive/support/components/list/list.component'
import { MilestonePathPipe } from '@strive/roadmap/pipes/path.pipe'

@Component({
    selector: 'journal-supports',
    templateUrl: './supports.page.html',
    styleUrls: ['./supports.page.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        RouterModule,
        PageLoadingComponent,
        HeaderRootComponent,
        SupportListComponent,
        MilestonePathPipe,
        IonContent,
        IonRefresher,
        IonRefresherContent
    ]
})
export class SupportsPageComponent {
  private auth = inject(AuthService);
  private goalService = inject(GoalService);
  private milestoneService = inject(MilestoneService);
  private modalCtrl = inject(ModalController);
  private profileService = inject(ProfileService);
  private screensize = inject(ScreensizeService);
  private support = inject(SupportService);


  objectivesWithSupports$: Observable<SupportsGroupedByGoal[]>
  uid$ = this.auth.uid$
  isMobile$ = this.screensize.isMobile$

  constructor() {
    const seo = inject(SeoService);

    seo.generateTags({ title: `Supports - Strive Journal` })

    this.objectivesWithSupports$ = this.auth.profile$.pipe(
      switchMap(profile => {
        if (!profile) return of([[], []])
        return combineLatest([
          this.support.valueChanges([where('supporterId', '==', profile.uid)]),
          this.support.valueChanges([where('recipientId', '==', profile.uid)])
        ])
      }),
      map(([supporter, recipient]) => [...supporter, ...recipient]),
      map(supports => supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)), // remove duplicates (when user is both supporter and recipient)
      joinWith({
        goal: ({ goalId }) => this.goalService.valueChanges(goalId),
        milestone: ({ milestoneId, goalId }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        recipient: ({ recipientId }) => this.profileService.valueChanges(recipientId),
        supporter: ({ supporterId }) => this.profileService.valueChanges(supporterId)
      }),
      map(groupByObjective),
      map(sortGroupedSupports)
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

  async refresh($event: RefresherCustomEvent) {
    await delay(500)
    $event?.target.complete()
  }
}
