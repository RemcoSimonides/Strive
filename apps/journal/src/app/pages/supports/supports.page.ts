import { Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
import { where } from 'firebase/firestore';
// Services
import { SeoService } from '@strive/utils/services/seo.service';
import { SupportService } from '@strive/support/support.service';
import { UserService } from '@strive/user/user/user.service';
// Rxjs
import { Observable, of, shareReplay } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// Components
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { SupportOptionsComponent } from '@strive/support/components/options/options.component';
import { delay, unique } from '@strive/utils/helpers';
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { AchieversModalComponent } from '@strive/support/modals/achievers/achievers.component';
import { GoalLink, MilestoneLink, createSupport, Support } from '@strive/model'

type GroupedByMilestone = MilestoneLink & { supports: Support[] }
type GroupedByGoal = GoalLink & { milestones: GroupedByMilestone[], supports: Support[] }

function groupByObjective(supports: Support[]): GroupedByGoal[] {

  const groups: GroupedByGoal[] = []

  const goalIds = unique(supports.map(support => support.source.goal.id))
  for (const goalId of goalIds) {
    const supportsOfGoal = supports.filter(support => support.source.goal.id === goalId).sort((a) => a.source.milestone?.id ? 1 : -1)
    const supportsWithoutMilestone = supportsOfGoal.filter(support => !support.source.milestone?.id)

    const group: GroupedByGoal = {
      ...supportsOfGoal[0].source.goal,
      supports: supportsWithoutMilestone,
      milestones: []
    }

    const milestoneIds = unique(supportsOfGoal.filter(support => support.source.milestone?.id).map(support => support.source.milestone?.id))
    for (const milestoneId of milestoneIds) {
      const supportsOfMilestone = supportsOfGoal.filter(support => support.source.milestone?.id === milestoneId)
      const groupByMilestone: GroupedByMilestone = {
        ...supportsOfMilestone[0].source.milestone!,
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

  supportsOpen$: Observable<Support[]>
  supportsToGive$: Observable<Support[]>
  supportsGiven$: Observable<Support[]>
  supportsNeedDecision$: Observable<GroupedByGoal[]>

  supportsToGet$: Observable<Support[]>
  supportsGotten$: Observable<Support[]>

  constructor(
    public user: UserService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    seo: SeoService,
    private support: SupportService,
    private goalStakeholderService: GoalStakeholderService
  ) {
    seo.generateTags({ title: `Supports - Strive Journal` })

    const supportsGive$: Observable<Support[]> = this.user.user$.pipe(
      switchMap(user => user ? this.support.groupChanges([where('source.supporter.uid', '==', user.uid)]) : of([])),
      map(supports => supports.map(support => createSupport(support))),
      shareReplay({ bufferSize: 1, refCount: true }),
    )
    const supportsGet$: Observable<Support[]> = this.user.user$.pipe(
      switchMap(user => user ? this.support.groupChanges([where('source.receiver.uid', '==', user.uid)]) : of([])),
      map(supports => supports.map(support => createSupport(support))),
      shareReplay({ bufferSize: 1, refCount: true })
    )

    this.supportsOpen$ = supportsGive$.pipe(
      map(supports => supports.filter(support => support.status === 'open'))
    )

    this.supportsToGive$ = supportsGive$.pipe(
      map(supports => supports.filter(support => support.status === 'waiting_to_be_paid'))
    )

    this.supportsGiven$ = supportsGive$.pipe(
      map(supports => supports.filter(support => support.status === 'paid'))
    )

    this.supportsNeedDecision$ = supportsGive$.pipe(
      map(supports => supports.filter(support => support.needsDecision)),
      map(groupByObjective)
    )

    this.supportsToGet$ = supportsGet$.pipe(
      map(supports => supports.filter(support => support.status === 'waiting_to_be_paid'))
    )

    this.supportsGotten$ = supportsGet$.pipe(
      map(supports => supports.filter(support => support.status === 'paid'))
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

  supportPaid(support: Support) {
    if (!support.id) return
    this.support.update(support.id, { status: 'paid' }, { params: { goalId: support.source.goal.id }})
  }

  openOptions(support: Support, event: any) {
    this.popoverCtrl.create({
      component: SupportOptionsComponent,
      event,
      componentProps: { support, goalId: support.source.goal.id }
    }).then(popover => popover.present())
  }

  async give(support: Support) {
    if (!support.id) return

    const { receiver } = support.source
    if (receiver) {
      this.support.update(support.id, { status: 'waiting_to_be_paid', needsDecision: false }, { params: { goalId: support.source.goal.id }})
    } else {
      const achievers = await this.goalStakeholderService.getValue([where('isAchiever', '==', true)], { goalId: support.source.goal.id })
      const modal = await this.modalCtrl.create({
        component: AchieversModalComponent,
        componentProps: { support, achievers }
      })
      modal.onDidDismiss().then(_ => {
        if (support.source.receiver) {
          this.support.update(support.id!, {
            ...support,
            status: 'waiting_to_be_paid',
            needsDecision: false
          }, { params: { goalId: support.source.goal.id }})
        }
      })
      modal.present()
    }
  }

  reject(support: Support) {
    if (!support.id) throw new Error('Trying to reject support but support.id is unknown')
    this.support.update(support.id, { status: 'rejected', needsDecision: false }, { params: { goalId: support.source.goal.id }})
  }
  
  async refresh($event: any) {
    await delay(500)
    $event?.target.complete()
  }
}
