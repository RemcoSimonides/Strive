import { Component, HostBinding, HostListener, Input, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavParams, ModalController, PopoverController } from '@ionic/angular';
// Rxjs
import { Observable, of } from 'rxjs';
// Services
import { GoalService } from '@strive/goal/goal/+state/goal.service'
import { SupportService } from '@strive/support/+state/support.service'
import { UserService } from '@strive/user/user/+state/user.service'
import { SupportForm } from '@strive/support/forms/support.form'
// Interfaces
import { createMilestoneLink, Milestone } from '@strive/goal/milestone/+state/milestone.firestore'
import { getStatusLabel, Support } from '@strive/support/+state/support.firestore'
import { createGoalLink, Goal } from '@strive/goal/goal/+state/goal.firestore'
// Components
import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { orderBy, where } from '@angular/fire/firestore';
import { map, switchMap } from 'rxjs/operators';
import { createUserLink } from '@strive/user/user/+state/user.firestore';
import { SupportOptionsComponent } from '../options/options.component';

@Component({
  selector: 'support-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddSupportModalComponent implements OnInit {
  origin: 'goal' | 'milestone'

  @Input() private goalId: string
  goal$: Observable<Goal>

  @Input() milestone: Milestone

  supports$: Observable<Support[]>
  mySupports$: Observable<Support[]>

  support = new SupportForm()

  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }
  @HostBinding() modal: HTMLIonModalElement

  constructor(
    private goalService: GoalService,
    private location: Location,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private supportService: SupportService,
    public user: UserService
  ) {
    window.history.pushState(null, null, window.location.href)
  }

  ngOnInit() {
    this.modal.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })

    this.origin = this.milestone ? 'milestone' : 'goal'
    this.goal$ = this.goalService.valueChanges(this.goalId)

    const params = { goalId: this.goalId }
    const supports$ = this.origin === 'milestone'
      ? this.supportService.valueChanges([where('milestone.id', '==', this.milestone.id)], params)
      : this.supportService.valueChanges([orderBy('createdAt', 'desc')], params)
    
    this.supports$ = supports$.pipe(
      map(supports => supports.sort(support => support.status === 'open' ? -1 : 1))
    )

    this.mySupports$ = this.user.user$.pipe(
      switchMap(user => {
        if (user) {
          return this.origin === 'milestone'
          ? this.supportService.valueChanges([where('milestone.id', '==', this.milestone.id), where('supporter.uid', '==', user.uid)], params)
          : this.supportService.valueChanges([where('supporter.uid', '==', user.uid), orderBy('createdAt', 'desc')], params)
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

  dismiss() {
    this.location.back()
  }

  addSupport(goal: Goal) {
    if (!this.support.description.value) return;

    this.support.goal.patchValue(createGoalLink({ ...goal, id: this.goalId }))
    this.support.supporter.patchValue(createUserLink(this.user.user))
    if (this.milestone) this.support.milestone.patchValue(createMilestoneLink(this.milestone))

    this.supportService.add(this.support.value, { params: { goalId: this.goalId }})
    this.support.description.setValue('')

    //Increase number of custom supports
    //IS FIREBASE FUNCTION

    //Set stakeholder as supporter
    //IS FIREBASE FUNCTION

    //Send notification to achievers of goal
    //IS FIREBASE FUNCTION
  }

  getStatusLabel(support: Support) {
    return getStatusLabel(support)
  }

  openOptions(support: Support, event) {
    this.popoverCtrl.create({
      component: SupportOptionsComponent,
      event,
      componentProps: { support }
    }).then(popover => popover.present())
  }

}
