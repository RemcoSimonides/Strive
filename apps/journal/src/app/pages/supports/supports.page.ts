import { Component } from '@angular/core'
import { ModalController, PopoverController } from '@ionic/angular'
import { where } from 'firebase/firestore'
import { joinWith } from 'ngfire'

import { Observable, of, shareReplay } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { compareDesc } from 'date-fns'
import { delay, unique } from '@strive/utils/helpers'
import { Goal, Milestone, Support, SupportStatus } from '@strive/model'

import { SeoService } from '@strive/utils/services/seo.service'
import { SupportService } from '@strive/support/support.service'
import { UserService } from '@strive/user/user/user.service'
import { GoalService } from '@strive/goal/goal/goal.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { SupportOptionsComponent } from '@strive/support/components/options/options.component'

type GroupedByMilestone = Milestone & { supports: Support[] }
type GroupedByGoal = Goal & { milestones: GroupedByMilestone[], supports: Support[] }

function groupByObjective(supports: Support[]): GroupedByGoal[] {

  const groups: GroupedByGoal[] = []

  const goalIds = unique(supports.map(support => support.goalId))
  for (const goalId of goalIds) {
    const supportsOfGoal = supports.filter(support => support.goalId === goalId).sort((a) => a.milestoneId ? 1 : -1)
    const supportsWithoutMilestone = supportsOfGoal.filter(support => !support.milestoneId)

    const group: GroupedByGoal = {
      ...supportsOfGoal[0].goal!,
      supports: supportsWithoutMilestone,
      milestones: []
    }

    const milestoneIds = unique(supportsOfGoal.filter(support => support.milestoneId).map(support => support.milestoneId))
    for (const milestoneId of milestoneIds) {
      const supportsOfMilestone = supportsOfGoal.filter(support => support.milestoneId === milestoneId)
      const groupByMilestone: GroupedByMilestone = {
        ...supportsOfMilestone[0].milestone!,
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
})
export class SupportsComponent {

  supportsNeedDecision$: Observable<GroupedByGoal[]>
  fromYouSupports$: Observable<Support[]>
  toYouSupports$: Observable<Support[]>

  segmentChoice: 'forYou' | 'fromYou' = 'fromYou'

  constructor(
    private goalService: GoalService,
    private milestoneService: MilestoneService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    seo: SeoService,
    private support: SupportService,
    public user: UserService,
  ) {
    seo.generateTags({ title: `Supports - Strive Journal` })

    const supportsGive$: Observable<Support[]> = this.user.user$.pipe(
      switchMap(user => user ? this.support.groupChanges([where('supporterId', '==', user.uid)]) : of([])),
      joinWith({
        goal: ({ goalId }) => this.goalService.valueChanges(goalId),
        milestone: ({ milestoneId, goalId  }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        recipient: ({ recipientId }) => this.user.valueChanges(recipientId)
      }),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
    
    this.fromYouSupports$ = supportsGive$.pipe(
      map(supports => supports.filter(support => support.status !== 'rejected' )), // dont show rejected supporteds
      map(supports => supports.sort((a, b) => compareDesc(a.createdAt!, b.createdAt!))),
      map(supports => supports.sort((a: any, b: any) => {
        const order: SupportStatus[] = ['open', 'waiting_to_be_paid', 'paid', 'rejected']
        if (order.indexOf(a.status) > order.indexOf(b.status)) return 1
        if (order.indexOf(a.status) < order.indexOf(b.status)) return -1
        return 0
      }))
    )

    this.toYouSupports$ = this.user.user$.pipe(
      switchMap(user => user ? this.support.groupChanges([where('recipientId', '==', user.uid)]) : of([])),
      joinWith({
        goal: ({ goalId }) => this.goalService.valueChanges(goalId),
        milestone: ({ milestoneId, goalId  }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined),
        supporter: ({ supporterId }) => this.user.valueChanges(supporterId)
      }),
      map(supports => supports.filter(support => support.status !== 'rejected' )), // dont show rejected supporteds
      map(supports => supports.sort((a, b) => compareDesc(a.createdAt!, b.createdAt!))),
      map(supports => supports.sort((a: any, b: any) => {
        const order: SupportStatus[] = ['open', 'waiting_to_be_paid', 'paid', 'rejected']
        if (order.indexOf(a.status) > order.indexOf(b.status)) return 1
        if (order.indexOf(a.status) < order.indexOf(b.status)) return -1
        return 0
      }))
    )

    this.supportsNeedDecision$ = supportsGive$.pipe(
      map(supports => supports.filter(support => support.needsDecision)),
      map(groupByObjective)
    )
  }

  segmentChanged(ev: CustomEvent) {
    this.segmentChoice = ev.detail.value
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  supportPaid(support: Support) {
    if (!support.id) return
    this.support.update(support.id, { status: 'paid' }, { params: { goalId: support.goalId }})
  }

  openOptions(support: Support, event: any) {
    this.popoverCtrl.create({
      component: SupportOptionsComponent,
      event,
      componentProps: { support, goalId: support.goalId }
    }).then(popover => popover.present())
  }

  give(support: Support) {
    if (!support.id) return
    this.support.update(support.id, { status: 'waiting_to_be_paid', needsDecision: false }, { params: { goalId: support.goalId }})
  }

  reject(support: Support) {
    if (!support.id) throw new Error('Trying to reject support but support.id is unknown')
    this.support.update(support.id, { status: 'rejected', needsDecision: false }, { params: { goalId: support.goalId }})
  }
  
  async refresh($event: any) {
    await delay(500)
    $event?.target.complete()
  }
}
