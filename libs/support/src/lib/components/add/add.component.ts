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
import { Goal, createMilestoneLink, Milestone, createSupport, Support } from '@strive/model'
// Components
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { map, switchMap } from 'rxjs/operators';
import { SupportOptionsComponent } from '../options/options.component';
import { ModalDirective } from '@strive/utils/directives/modal.directive';
import { createSupportSource } from '@strive/model';
import { FormControl } from '@angular/forms';

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

  form = new FormControl('', { nonNullable: true })

  constructor(
    private goalService: GoalService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
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

  addSupport(goal: Goal) {
    if (this.form.invalid) return

    const source = createSupportSource({
      goal,
      supporter: this.user.user
    })
    if (this.milestone) source.milestone = createMilestoneLink(this.milestone)
    const support = createSupport({
      description: this.form.value,
      source
    })

    this.supportService.add(support, { params: { goalId: this.goalId }})
    this.form.setValue('')
  }

  openOptions(support: Support, event: Event) {
    this.popoverCtrl.create({
      component: SupportOptionsComponent,
      event,
      componentProps: { support }
    }).then(popover => popover.present())
  }
}
