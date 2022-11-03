import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { FormControl, Validators } from '@angular/forms'
import { Location } from '@angular/common'
import { ModalController, Platform, PopoverController } from '@ionic/angular'
import { where } from 'firebase/firestore'
import { joinWith } from 'ngfire'

import { compareAsc } from 'date-fns'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { Observable, of } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'

import { AuthService } from '@strive/user/auth/auth.service'
import { GoalService } from '@strive/goal/goal/goal.service'
import { SupportService } from '@strive/support/support.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service'
import { MilestoneService } from '@strive/goal/milestone/milestone.service'

import { Goal, Milestone, createSupportBase, Support } from '@strive/model'

import { SupportOptionsComponent } from '../options/options.component'
import { AchieversModalComponent } from '@strive/support/modals/achievers/achievers.component'
import { ProfileService } from '@strive/user/user/profile.service'

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
    private auth: AuthService,
    private goalService: GoalService,
    protected override location: Location,
    private milestoneService: MilestoneService,
    protected override modalCtrl: ModalController,
    protected override platform: Platform,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
    private stakeholderService: GoalStakeholderService,
    private supportService: SupportService
  ) {
    super(location, modalCtrl, platform)
  }

  ngOnInit() {
    this.origin = this.milestone ? 'milestone' : 'goal'
    this.goal$ = this.goalService.valueChanges(this.goalId)

    const params = { goalId: this.goalId }
    this.forYouSupports$ = this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of([])
        return this.origin === 'milestone'
          ? this.supportService.valueChanges([where('recipientId', '==', user.uid), where('milestoneId', '==', this.milestone?.id)], params)
          : this.supportService.valueChanges([where('recipientId', '==', user.uid)], params)
      }),
      joinWith({
        supporter: ({ supporterId }) => this.profileService.valueChanges(supporterId),
        milestone: ({ goalId, milestoneId }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined)
      }, { shouldAwait: true }),
      map(supports => supports.sort((a, b) => compareAsc(a.createdAt, b.createdAt))),
      map(supports => supports.sort(support => support.status === 'open' ? -1 : 1))
    )

    this.fromYouSupports$ = this.auth.user$.pipe(
      switchMap(user => {
        if (!user) return of([])
        return this.origin === 'milestone'
          ? this.supportService.valueChanges([where('supporterId', '==', user.uid), where('milestoneId', '==', this.milestone?.id), ], params)
          : this.supportService.valueChanges([where('supporterId', '==', user.uid)], params)
      }),
      joinWith({
        recipient: ({ recipientId }) => this.profileService.valueChanges(recipientId),
        milestone: ({ goalId, milestoneId }) => milestoneId ? this.milestoneService.valueChanges(milestoneId, { goalId }) : of(undefined)
      }, { shouldAwait: true }),
      map(supports => supports.sort((a, b) => compareAsc(a.createdAt, b.createdAt))),
      map(supports => supports.sort(support => support.status === 'open' ? -1 : 1))
    )
  }

  async addSupport(goal: Goal) {
    if (this.form.invalid) return
    if (!this.auth.uid) return

    const support = createSupportBase({
      description: this.form.value,
      goalId: goal.id,
      milestoneId: this.milestone?.id,
      supporterId: this.auth.uid
    })

    if (this.milestone?.achieverId) {
      support.recipientId = this.milestone.achieverId
      this.form.setValue('')
      return this.supportService.add(support, { params: { goalId: this.goalId }})
    }

    const stakeholders = await this.stakeholderService.getValue([where('isAchiever', '==', true)], { goalId: this.goalId })
    const profiles = await this.profileService.getValue(stakeholders.map(a => a.uid))
    const achievers = stakeholders.map(stakeholder => ({ ...stakeholder, profile: profiles.find(profile => profile.uid === stakeholder.uid)}))
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
