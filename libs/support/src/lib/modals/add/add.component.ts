import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { Location } from '@angular/common'
import { ModalController } from '@ionic/angular/standalone'

import { where } from 'firebase/firestore'
import { joinWith } from 'ngfire'

import { combineLatest, map, Observable, of, switchMap } from 'rxjs'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { Goal, groupByObjective, Milestone, sortGroupedSupports, SupportsGroupedByGoal } from '@strive/model'

import { AuthService } from '@strive/auth/auth.service'
import { SupportService } from '@strive/support/support.service'
import { ProfileService } from '@strive/user/profile.service'

@Component({
  selector: '[goal] strive-support-modal',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSupportModalComponent extends ModalDirective implements OnInit {

  @Input() goal!: Goal
  @Input() milestone?: Milestone

  supports$?: Observable<SupportsGroupedByGoal[]>

  constructor(
    private auth: AuthService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private profileService: ProfileService,
    private support: SupportService
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    this.supports$ = this.auth.profile$.pipe(
      switchMap(user => {
        if (!user) return of([[], []])

        const params = { goalId: this.goal.id }

        const recipientQuery = this.milestone
          ? this.support.valueChanges([where('recipientId', '==', user.uid), where('milestoneId', '==', this.milestone.id)], params)
          : this.support.valueChanges([where('recipientId', '==', user.uid)], params)

        const supporterQuery = this.milestone
          ? this.support.valueChanges([where('supporterId', '==', user.uid), where('milestoneId', '==', this.milestone?.id),], params)
          : this.support.valueChanges([where('supporterId', '==', user.uid)], params)

        return combineLatest([
          supporterQuery,
          recipientQuery
        ])
      }),
      map(([supporter, recipient]) => [...supporter, ...recipient]),
      map(supports => supports.filter((support, index) => supports.findIndex(s => s.id === support.id) === index)), // remove duplicates (when user is both supporter and recipient)
      joinWith({
        goal: () => this.goal,
        milestone: () => this.milestone,
        recipient: ({ recipientId }) => this.profileService.valueChanges(recipientId),
        supporter: ({ supporterId }) => this.profileService.valueChanges(supporterId)
      }, { shouldAwait: true }),
      map(groupByObjective),
      map(sortGroupedSupports)
    )
  }
}
