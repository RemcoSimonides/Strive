import { ChangeDetectionStrategy, Component } from '@angular/core'
import { ModalController, RefresherCustomEvent } from '@ionic/angular'

import { where } from 'firebase/firestore'
import { joinWith } from 'ngfire'

import { combineLatest, Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { delay, unique } from '@strive/utils/helpers'
import { Goal, Milestone, Support } from '@strive/model'

import { SeoService } from '@strive/utils/services/seo.service'
import { SupportService } from '@strive/support/support.service'
import { GoalService } from '@strive/goal/goal/goal.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'
import { AuthService } from '@strive/user/auth/auth.service'
import { ProfileService } from '@strive/user/user/profile.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'

type GroupedByMilestone = Milestone & { supports: Support[] }
type GroupedByGoal = Goal & { milestones: GroupedByMilestone[], supports: Support[] }

function groupByObjective(supports: Support[]): GroupedByGoal[] {

  const groups: GroupedByGoal[] = []

  const goalIds = unique(supports.map(support => support.goalId))
  for (const goalId of goalIds) {
    const supportsOfGoal = supports.filter(support => support.goalId === goalId).sort((a) => a.milestoneId ? 1 : -1)
    const supportsWithoutMilestone = supportsOfGoal.filter(support => !support.milestoneId)

    const group: GroupedByGoal = {
      ...supportsOfGoal[0].goal as Goal,
      supports: supportsWithoutMilestone,
      milestones: []
    }

    const milestoneIds = unique(supportsOfGoal.filter(support => support.milestoneId).map(support => support.milestoneId))
    for (const milestoneId of milestoneIds) {
      const supportsOfMilestone = supportsOfGoal.filter(support => support.milestoneId === milestoneId)
      const groupByMilestone: GroupedByMilestone = {
        ...supportsOfMilestone[0].milestone as Milestone,
        supports: supportsOfMilestone
      }
      group.milestones.push(groupByMilestone)
    }

    groups.push(group)
  }

  return groups
}

@Component({
  selector: 'journal-supports',
  templateUrl: './supports.page.html',
  styleUrls: ['./supports.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SupportsComponent {

  objectivesWithSupports$: Observable<GroupedByGoal[]>
  uid$ = this.auth.uid$

  constructor(
    private auth: AuthService,
    private goalService: GoalService,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private profileService: ProfileService,
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
      joinWith({
        goal: ({ goalId }) => this.goalService.valueChanges(goalId),
        milestone: ({ milestoneId, goalId  }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        recipient: ({ recipientId }) => this.profileService.valueChanges(recipientId),
        supporter: ({ supporterId }) => this.profileService.valueChanges(supporterId)
      }),
      map(groupByObjective)
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

  give(support: Support) {
    if (!support.id) return
    this.support.update(support.id, { status: 'waiting_to_be_paid', needsDecision: false }, { params: { goalId: support.goalId }})
  }

  reject(support: Support) {
    if (!support.id) throw new Error('Trying to reject support but support.id is unknown')
    this.support.update(support.id, { status: 'rejected', needsDecision: false }, { params: { goalId: support.goalId }})
  }
  
  async refresh($event: RefresherCustomEvent) {
    await delay(500)
    $event?.target.complete()
  }
}
