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
import { getNrOfDotsInSeqno, getPartOfSeqno } from '@strive/milestone/+state/milestone.model';
import { SupportForm } from '@strive/support/forms/support.form'
// Interfaces
import { Milestone } from '@strive/milestone/+state/milestone.firestore'
import { Support } from '@strive/support/+state/support.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
// Components
import { AuthModalPage, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { RoadmapService } from '@strive/milestone/+state/roadmap.service';
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
  public nrOfDotsInSeqno = 0

  public supports$: Observable<Support[]>
  public mySupports$: Observable<Support[]>
  public _support: string = '' // Value in text field

  public support = new SupportForm()

  constructor(
    private afAuth: Auth,
    private goalService: GoalService,
    private location: Location,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private roadmap: RoadmapService,
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
      let milestoneLevel: string
      const params = { goalId: this.goalId }

      if (this.origin === 'milestone') {
        this.nrOfDotsInSeqno = getNrOfDotsInSeqno(this.milestone.sequenceNumber)
        milestoneLevel = `path.level${this.nrOfDotsInSeqno + 1}id`
        this.supports$ = this.supportService.valueChanges([where(milestoneLevel, '==', this.milestone.id)], params)
      } else {
        this.supports$ = this.supportService.valueChanges([orderBy('createdAt', 'desc')], params)
      }
    
      if (!!user) {
        const { uid, displayName, photoURL } = user
  
        this.support.supporter.uid.patchValue(uid)
        this.support.supporter.username.patchValue(displayName)
        this.support.supporter.photoURL.patchValue(photoURL)
        
        if (this.origin === 'milestone') {
          this.mySupports$ = this.supportService.valueChanges([where(milestoneLevel, '==', this.milestone.id), where('supporter.uid', '==', uid)], params)
        } else {
          this.mySupports$ = this.supportService.valueChanges([where('supporter.uid', '==', uid), orderBy('createdAt', 'desc')], params)
        }
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
    if (!!this.milestone) {
      this.support.milestone.id.patchValue(this.milestone.id)
      this.support.milestone.description.patchValue(this.milestone.description)
      await this.determinePath(this.goalId, this.milestone.sequenceNumber, this.support)
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

  public getMilestoneBreadcrumbs(support: Support) {
    if (this.origin === 'goal') return

    const cutOff = (description: string) => description.length > 15 ? `${support.path.level2description.substr(0, 15).trim()}... > ` : `${description} > `

    const milestone3 = support.path?.level3description?.substr(0, 20) ?? ''
    const milestone2 = !!milestone3 ? cutOff(support.path.level2description) : support.path?.level2description?.substr(0, 20) ?? ''
    const milestone1 = !!milestone2 ? cutOff(support.path.level1description) : support.path?.level1description?.substr(0, 20) ?? ''

    return `${milestone1}${milestone2}${milestone3}`
  }

  private async determinePath(goalId: string, sequenceNumber: string, support: SupportForm) {
    const nrOfDotsInSeqNo = getNrOfDotsInSeqno(sequenceNumber);

    for (let i = 0; i <= nrOfDotsInSeqNo; i++) {
      if (i === nrOfDotsInSeqNo) {
        support.path.get(`level${i + 1}description`).patchValue(support.milestone.description.value)
        support.path.get(`level${i + 1}id`).patchValue(support.milestone.id.value)
      } else {
        const milestone = await this.roadmap.getMilestoneWithSeqno(goalId, getPartOfSeqno(sequenceNumber, i))
        support.path.get(`level${i + 1}description`).patchValue(milestone.description)
        support.path.get(`level${i + 1}id`).patchValue(milestone.id)
      }
    }
  }
}
