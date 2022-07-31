import { Component } from '@angular/core';
import { ModalController, PopoverController } from '@ionic/angular';
// Services
import { SeoService } from '@strive/utils/services/seo.service';
import { SupportService } from '@strive/support/+state/support.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Rxjs
import { Observable, of, shareReplay } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
// Interfaces
import { createSupport, Support } from '@strive/support/+state/support.firestore'
// Components
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { where } from '@angular/fire/firestore';
import { SupportOptionsComponent } from '@strive/support/components/options/options.component';
import { toDate, unique } from '@strive/utils/helpers';
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { AchieversModalComponent } from '@strive/support/modals/achievers/achievers.component';
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { GoalLink } from '@strive/goal/goal/+state/goal.firestore';
import { MilestoneLink } from '@strive/goal/milestone/+state/milestone.firestore';

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
      supports: supportsOfGoal.length > supportsWithoutMilestone.length ? supportsOfGoal : supportsWithoutMilestone,
      milestones: []
    }

    const milestoneIds = unique(supportsOfGoal.filter(support => support.source.milestone?.id).map(support => support.source.milestone?.id))
    for (const milestoneId of milestoneIds) {
      const supportsOfMilestone = supportsOfGoal.filter(support => support.source.milestone?.id === milestoneId)
      const groupByMilestone: GroupedByMilestone = {
        ...supportsOfMilestone[0].source.milestone,
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
      map(supports => supports.map(support => createSupport(toDate(support)))),
      shareReplay({ bufferSize: 1, refCount: true }),

      tap(toGet => console.log('to get:', toGet))
    )
    const supportsGet$: Observable<Support[]> = this.user.user$.pipe(
      switchMap(user => user ? this.support.groupChanges([where('source.receiver.uid', '==', user.uid)]) : of([])),
      map(supports => supports.map(support => createSupport(toDate(support)))),
      shareReplay({ bufferSize: 1, refCount: true }),
      tap(toGive => console.log('to give: ', toGive))
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
    this.support.update(support.id, { status: 'paid' }, { params: { goalId: support.source.goal.id }})
  }

  openOptions(support: Support, event) {
    this.popoverCtrl.create({
      component: SupportOptionsComponent,
      event,
      componentProps: { support, goalId: support.source.goal.id }
    }).then(popover => popover.present())
  }

  async give(support: Support) {
    if (support.source.receiver?.uid) {
      this.support.update(support.id, { status: 'waiting_to_be_paid', needsDecision: false }, { params: { goalId: support.source.goal.id }})
    } else {
      const achievers = await this.goalStakeholderService.getValue([where('isAchiever', '==', true)], { goalId: support.source.goal.id })
      const modal = await this.modalCtrl.create({
        component: AchieversModalComponent,
        componentProps: { achievers }
      })
      modal.onDidDismiss().then(res => {
        const { data } = res
        if (data) {
          support.source.receiver = createUserLink(data)
          this.support.update(support.id, {
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
    this.support.update(support.id, { status: 'rejected', needsDecision: false }, { params: { goalId: support.source.goal.id }})
  }
  
}
