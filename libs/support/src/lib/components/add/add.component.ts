import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { Location } from '@angular/common'
import { ModalController, PopoverController } from '@ionic/angular'
import { where } from 'firebase/firestore'
import { joinWith } from 'ngfire'

import { compareAsc } from 'date-fns'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { GoalService } from '@strive/goal/goal/goal.service'
import { SupportService } from '@strive/support/support.service'
import { UserService } from '@strive/user/user/user.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'

import { Goal, Milestone, createSupportBase, Support } from '@strive/model'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { SupportOptionsComponent } from '../options/options.component'
import { AchieversModalComponent } from '@strive/support/modals/achievers/achievers.component'

@Component({
  selector: '[goalId] support-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddSupportModalComponent extends ModalDirective implements OnInit {
  origin?: 'goal' | 'milestone'

  @Input() goalId!: string
  goal$?: Observable<Goal | undefined>

  @Input() milestone?: Milestone

  forYouSupports$?: Observable<Support[]>
  fromYouSupports$?: Observable<Support[]>

  form = new FormControl('', { validators: [Validators.required, Validators.maxLength(60)], nonNullable: true })

  constructor(
    private goalService: GoalService,
    protected override location: Location,
    private milestoneService: MilestoneService,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private stakeholderService: GoalStakeholderService,
    private supportService: SupportService,
    public user: UserService
  ) {
    super(location, modalCtrl)
  }

  ngOnInit() {
    this.origin = this.milestone ? 'milestone' : 'goal'
    this.goal$ = this.goalService.valueChanges(this.goalId)

    const params = { goalId: this.goalId }
    this.forYouSupports$ = this.user.user$.pipe(
      switchMap(user => {
        if (!user) return of([])
        return this.origin === 'milestone'
          ? this.supportService.valueChanges([where('recipientId', '==', user.uid), where('milestoneId', '==', this.milestone!.id)], params)
          : this.supportService.valueChanges([where('recipientId', '==', user.uid)], params)
      }),
      joinWith({
        supporter: ({ supporterId }) => this.user.valueChanges(supporterId),
        milestone: ({ milestoneId }) => milestoneId ? this.milestoneService.valueChanges(milestoneId) : of(undefined)
      }, { shouldAwait: true }),
      map(supports => supports.sort((a, b) => compareAsc(a.createdAt!, b.createdAt!))),
      map(supports => supports.sort(support => support.status === 'open' ? -1 : 1))
    )

    this.fromYouSupports$ = this.user.user$.pipe(
      switchMap(user => {
        if (!user) return of([])
        return this.origin === 'milestone'
          ? this.supportService.valueChanges([where('supporterId', '==', user.uid), where('milestoneId', '==', this.milestone!.id), ], params)
          : this.supportService.valueChanges([where('supporterId', '==', user.uid)], params)
      }),
      joinWith({
        recipient: ({ recipientId }) => this.user.valueChanges(recipientId),
        milestone: ({ milestoneId }) => milestoneId ? this.milestoneService.valueChanges(milestoneId) : of(undefined)
      }, { shouldAwait: true }),
      map(supports => supports.sort((a, b) => compareAsc(a.createdAt!, b.createdAt!))),
      map(supports => supports.sort(support => support.status === 'open' ? -1 : 1))
    )
  }

  openLoginModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  async addSupport(goal: Goal) {
    if (this.form.invalid) return
    if (!this.user.uid) return

    const support = createSupportBase({
      description: this.form.value,
      goalId: goal.id,
      milestoneId: this.milestone?.id,
      supporterId: this.user.uid
    })

    if (this.milestone?.achieverId) {
      support.recipientId = this.milestone.achieverId
      this.form.setValue('')
      return this.supportService.add(support, { params: { goalId: this.goalId }})
    }

    const achievers = await this.stakeholderService.getValue([where('isAchiever', '==', true)], { goalId: this.goalId })
    if (achievers.length === 1) {
      support.recipientId = achievers[0].uid
      this.form.setValue('')
      return this.supportService.add(support, { params: { goalId: this.goalId }})
    } else {
      const recipients: string[] = []
      const modal = await this.modalCtrl.create({
        component: AchieversModalComponent,
        componentProps: { recipients, achievers }
      })
      modal.onDidDismiss().then(_ => {
        for (const recipientId of recipients) {
          const result = createSupportBase({ ...support, recipientId })
          this.supportService.add(result, { params: { goalId: this.goalId }})
        }
      })
      modal.present()
      this.form.setValue('')
    }
    return
  }

  openOptions(support: Support, event: Event) {
    this.popoverCtrl.create({
      component: SupportOptionsComponent,
      event,
      componentProps: { support }
    }).then(popover => popover.present())
  }
}
