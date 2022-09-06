import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ModalController, PopoverController } from '@ionic/angular';
import { where } from 'firebase/firestore';
// Rxjs
import { Observable, of } from 'rxjs';
// Services
import { GoalService } from '@strive/goal/goal/goal.service'
import { SupportService } from '@strive/support/support.service'
import { UserService } from '@strive/user/user/user.service'
// Interfaces
import { Goal, Milestone, createSupport, Support, createUserLink, UserLink } from '@strive/model'
// Components
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { map, switchMap } from 'rxjs/operators';
import { SupportOptionsComponent } from '../options/options.component';
import { ModalDirective } from '@strive/utils/directives/modal.directive';
import { createSupportSource } from '@strive/model';
import { FormControl, Validators } from '@angular/forms';
import { AchieversModalComponent } from '@strive/support/modals/achievers/achievers.component';
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { compareAsc } from 'date-fns'

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
          ? this.supportService.valueChanges([where('source.recipient.uid', '==', user.uid), where('source.milestone.id', '==', this.milestone!.id)], params)
          : this.supportService.valueChanges([where('source.recipient.uid', '==', user.uid)], params)
      }),
      map(supports => supports.sort((a, b) => compareAsc(a.createdAt!, b.createdAt!))),
      map(supports => supports.sort(support => support.status === 'open' ? -1 : 1))
    )

    this.fromYouSupports$ = this.user.user$.pipe(
      switchMap(user => {
        if (!user) return of([])
        return this.origin === 'milestone'
          ? this.supportService.valueChanges([where('source.supporter.uid', '==', user.uid), where('source.milestone.id', '==', this.milestone!.id), ], params)
          : this.supportService.valueChanges([where('source.supporter.uid', '==', user.uid)], params)
      }),
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

    const support = createSupport({
      description: this.form.value,
      source: createSupportSource({
        goal,
        milestone: this.milestone,
        supporter: this.user.user
      })
    })

    if (this.milestone?.achiever?.uid) {
      support.source.recipient = this.milestone.achiever
      this.form.setValue('')
      return this.supportService.add(support, { params: { goalId: this.goalId }})
    }

    const achievers = await this.stakeholderService.getValue([where('isAchiever', '==', true)], { goalId: this.goalId })
    if (achievers.length === 1) {
      support.source.recipient = createUserLink(achievers[0])
      this.form.setValue('')
      return this.supportService.add(support, { params: { goalId: this.goalId }})
    } else {
      const recipients: UserLink[] = []
      const modal = await this.modalCtrl.create({
        component: AchieversModalComponent,
        componentProps: { recipients, achievers }
      })
      modal.onDidDismiss().then(_ => {
        for (const recipient of recipients) {
          const result = createSupport({
            ...support,
            source: createSupportSource({
              ...support.source,
              recipient
            })
          })
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
