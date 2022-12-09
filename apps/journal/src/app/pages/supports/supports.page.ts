import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ModalController, RefresherCustomEvent } from '@ionic/angular'

import { where } from 'firebase/firestore'
import { joinWith } from 'ngfire'

import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { delay } from '@strive/utils/helpers'
import { groupByObjective, sortGroupedSupports, SupportsGroupedByGoal } from '@strive/model'

import { SeoService } from '@strive/utils/services/seo.service'
import { SupportService } from '@strive/support/support.service'
import { GoalService } from '@strive/goal/goal/goal.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { AuthService } from '@strive/user/auth/auth.service'
import { ProfileService } from '@strive/user/user/profile.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { ScreensizeService } from '@strive/utils/services/screensize.service'

@Component({
  selector: 'journal-supports',
  templateUrl: './supports.page.html',
  styleUrls: ['./supports.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportsComponent {

  objectivesWithSupports$: Observable<SupportsGroupedByGoal[]>
  uid$ = this.auth.uid$
  isMobile$ = this.screensize.isMobile$

  constructor(
    private auth: AuthService,
    private goalService: GoalService,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private profileService: ProfileService,
    private screensize: ScreensizeService,
    seo: SeoService,
    private support: SupportService
  ) {
    seo.generateTags({ title: `Supports - Strive Journal` })

    this.objectivesWithSupports$ = this.auth.profile$.pipe(
      switchMap(profile => {
        if (!profile) return of([[], []])
        return combineLatest([
          this.support.valueChanges([where('supporterId', '==', profile.uid)]),
          this.support.valueChanges([where('recipientId', '==', profile.uid)])
        ])
      }),
      map(([ supporter, recipient ]) => [...supporter, ...recipient ]),
      map(supports => supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)), // remove duplicates (when user is both supporter and recipient)
      joinWith({
        goal: ({ goalId }) => this.goalService.valueChanges(goalId),
        milestone: ({ milestoneId, goalId  }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
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
