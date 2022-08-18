import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ModalController, PopoverController } from '@ionic/angular';
import { orderBy, where } from 'firebase/firestore';
// Rxjs
import { Observable, of } from 'rxjs';
// Services
import { GoalService } from '@strive/goal/goal/goal.service'
import { SupportService } from '@strive/support/support.service'
import { UserService } from '@strive/user/user/user.service'
// Interfaces
import { Goal, Milestone, createSupport, Support, createUserLink } from '@strive/model'
// Components
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { map, switchMap } from 'rxjs/operators';
import { SupportOptionsComponent } from '../options/options.component';
import { ModalDirective } from '@strive/utils/directives/modal.directive';
import { createSupportSource } from '@strive/model';
import { FormControl, Validators } from '@angular/forms';
import { AchieversModalComponent } from '@strive/support/modals/achievers/achievers.component';
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';

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

  supports$?: Observable<Support[]>
  mySupports$?: Observable<Support[]>

  form = new FormControl('', { validators: [Validators.required], nonNullable: true })

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
    const supports$ = this.origin === 'milestone'
      ? this.supportService.valueChanges([where('source.milestone.id', '==', this.milestone!.id)], params)
      : this.supportService.valueChanges([orderBy('createdAt', 'desc')], params)
    
    this.supports$ = supports$.pipe(
      map(supports => supports.sort(support => support.status === 'open' ? -1 : 1))
    )

    this.mySupports$ = this.user.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.origin === 'milestone'
          ? this.supportService.valueChanges([where('source.milestone.id', '==', this.milestone!.id), where('source.supporter.uid', '==', user.uid)], params)
          : this.supportService.valueChanges([where('source.supporter.uid', '==', user.uid), orderBy('createdAt', 'desc')], params)
        } else return of([])
      })
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
    this.form.setValue('')

    if (this.milestone?.achiever?.uid) {
      support.source.receiver = this.milestone.achiever
      return this.supportService.add(support, { params: { goalId: this.goalId }})
    }

    const achievers = await this.stakeholderService.getValue([where('isAchiever', '==', true)], { goalId: this.goalId })
    if (achievers.length === 1) {
      support.source.receiver = createUserLink(achievers[0])
      return this.supportService.add(support, { params: { goalId: this.goalId }})
    } else {
      const modal = await this.modalCtrl.create({
        component: AchieversModalComponent,
        componentProps: { support, achievers }
      })
      modal.onDidDismiss().then(_ => {
        this.supportService.add(support, { params: { goalId: this.goalId }})
      })
      modal.present()
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
