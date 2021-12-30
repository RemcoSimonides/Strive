import { Component, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { NavParams, ModalController } from '@ionic/angular';
// Angularfire
import { Auth, user } from '@angular/fire/auth';
// Rxjs
import { Observable } from 'rxjs';
// Services
import { GoalService } from '@strive/goal/goal/+state/goal.service'
import { SupportService } from '@strive/support/+state/support.service'
import { UserService } from '@strive/user/user/+state/user.service';
import { SupportForm } from '@strive/support/forms/support.form'
// Interfaces
import { Milestone } from '@strive/milestone/+state/milestone.firestore'
import { Support } from '@strive/support/+state/support.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
// Components
import { AuthModalPage, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { orderBy, where } from '@angular/fire/firestore';

@Component({
  selector: 'support-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss'],
})
export class AddSupportModalComponent implements OnInit {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }

  public origin: 'goal' | 'milestone'

  private goalId: string
  public goal$: Observable<Goal>

  public milestone: Milestone

  public supports$: Observable<Support[]>
  public mySupports$: Observable<Support[]>

  public support = new SupportForm()

  constructor(
    private afAuth: Auth,
    private goalService: GoalService,
    private location: Location,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private supportService: SupportService,
    public user: UserService
  ) {
    window.history.pushState(null, null, window.location.href)
    modalCtrl.getTop().then(modal => {
      modal.onWillDismiss().then(res => {
        if (res.role === 'backdrop') this.location.back()
      })
    })
  }

  ngOnInit() {
    this.goalId = this.navParams.get('goalId')
    this.milestone = this.navParams.get('milestone')
    this.origin = !!this.milestone ? 'milestone' : 'goal'
    this.goal$ = this.goalService.valueChanges(this.goalId)

    user(this.afAuth).subscribe(user => {
      const params = { goalId: this.goalId }

      this.supports$ = this.origin === 'milestone'
        ? this.supportService.valueChanges([where('milestone.id', '==', this.milestone.id)], params)
        : this.supportService.valueChanges([orderBy('createdAt', 'desc')], params)

      if (user) {
        const { uid, displayName, photoURL } = user
  
        this.support.supporter.uid.patchValue(uid)
        this.support.supporter.username.patchValue(displayName)
        this.support.supporter.photoURL.patchValue(photoURL)
        
        this.mySupports$ = this.origin === 'milestone'
          ? this.supportService.valueChanges([where('milestone.id', '==', this.milestone.id), where('supporter.uid', '==', uid)], params)
          : this.supportService.valueChanges([where('supporter.uid', '==', uid), orderBy('createdAt', 'desc')], params)
      }
    })
  }

  openLoginModal() {
    this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }

  dismiss() {
    this.location.back()
  }

  async addSupport(goal: Goal) {

    if (!this.support.description.value) return;

    this.support.goal.id.patchValue(this.goalId)
    this.support.goal.title.patchValue(goal.title)
    this.support.goal.image.patchValue(goal.image)
    if (this.milestone) {
      this.support.milestone.id.patchValue(this.milestone.id)
      this.support.milestone.content.patchValue(this.milestone.content)
    }

    this.supportService.add(this.support.value, { params: { goalId: this.goalId }})
    this.support.reset();

    //Increase number of custom supports
    //IS FIREBASE FUNCTION

    //Set stakeholder as supporter
    //IS FIREBASE FUNCTION

    //Send notification to achievers of goal
    //IS FIREBASE FUNCTION
  }

}
