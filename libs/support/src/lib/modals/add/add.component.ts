import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common';
import { IonContent, IonTitle } from '@ionic/angular/standalone'

import { where } from 'firebase/firestore'
import { joinWith } from '@strive/utils/firebase'

import { combineLatest, map, Observable, of, switchMap } from 'rxjs'

import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { Goal, groupByObjective, Milestone, sortGroupedSupports, SupportsGroupedByGoal } from '@strive/model'

import { AuthService } from '@strive/auth/auth.service'
import { SupportService } from '@strive/support/support.service'
import { ProfileService } from '@strive/user/profile.service'
import { SupportListComponent } from '@strive/support/components/list/list.component'
import { AddSupportComponent } from '@strive/support/components/add/add.component'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
    selector: '[goal] strive-support-modal',
    templateUrl: './add.component.html',
    styleUrls: ['./add.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        SupportListComponent,
        AddSupportComponent,
        HeaderModalComponent,
        IonTitle,
        IonContent,
    ]
})
export class AddSupportModalComponent extends ModalDirective implements OnInit {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private support = inject(SupportService);


  @Input() goal!: Goal
  @Input() milestone?: Milestone

  supports$?: Observable<SupportsGroupedByGoal[]>

  constructor() {
    super()
  }

  ngOnInit() {
    this.supports$ = this.auth.profile$.pipe(
      switchMap(user => {
        if (!user) return of([[], []])

        const params = { goalId: this.goal.id }

        const recipientQuery = this.milestone
          ? this.support.collectionData([where('recipientId', '==', user.uid), where('milestoneId', '==', this.milestone.id)], params)
          : this.support.collectionData([where('recipientId', '==', user.uid)], params)

        const supporterQuery = this.milestone
          ? this.support.collectionData([where('supporterId', '==', user.uid), where('milestoneId', '==', this.milestone?.id),], params)
          : this.support.collectionData([where('supporterId', '==', user.uid)], params)

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
        recipient: ({ recipientId }) => this.profileService.docData(recipientId),
        supporter: ({ supporterId }) => this.profileService.docData(supporterId)
      }, { shouldAwait: true }),
      map(groupByObjective),
      map(sortGroupedSupports)
    )
  }
}
