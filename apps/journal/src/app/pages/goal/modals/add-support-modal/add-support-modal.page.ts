import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
// Angularfire
import { AngularFireAuth } from '@angular/fire/auth';
// Rxjs
import { Observable } from 'rxjs';
// Services
import { GoalService } from '@strive/goal/goal/+state/goal.service'
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service'
import { FirestoreService } from 'apps/journal/src/app/services/firestore/firestore.service';
import { SupportService } from '@strive/support/+state/support.service'
import { UserService } from '@strive/user/user/+state/user.service';
import { getNrOfDotsInSeqno, getPartOfSeqno } from '@strive/milestone/+state/milestone.model';
import { SupportForm } from '@strive/support/forms/support.form'
// Interfaces
import { IMilestone } from '@strive/interfaces'
import { Support } from '@strive/support/+state/support.firestore'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
// Components
import { AuthModalPage, enumAuthSegment } from 'apps/journal/src/app/pages/auth/auth-modal.page';
import { RoadmapService } from 'apps/journal/src/app/services/roadmap/roadmap.service';

@Component({
  selector: 'app-add-support-modal',
  templateUrl: './add-support-modal.page.html',
  styleUrls: ['./add-support-modal.page.scss'],
})
export class AddSupportModalPage implements OnInit {

  public origin: 'goal' | 'milestone'

  private goalId: string
  public goal$: Observable<Goal>

  public milestone: IMilestone
  public nrOfDotsInSeqno = 0

  public supports$: Observable<Support[]>
  public mySupports$: Observable<Support[]>
  public _support: string = '' // Value in text field

  public support = new SupportForm()

  constructor(
    private afAuth: AngularFireAuth,
    private db: FirestoreService,
    private goalStakeholder: GoalStakeholderService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private roadmap: RoadmapService,
    private supportService: SupportService,
    public user: UserService
  ) { }

  ngOnInit() {
    this.goalId = this.navParams.get('goalId')
    this.milestone = this.navParams.get('milestone')
    this.origin = !!this.milestone ? 'milestone' : 'goal'
    this.goal$ = this.goalService.getGoalDocObs(this.goalId)

    this.afAuth.authState.subscribe(authState => {
      const { uid, displayName, photoURL } = authState
      const reference = `Goals/${this.goalId}/Supports`

      this.support.supporter.uid.patchValue(uid)
      this.support.supporter.username.patchValue(displayName)
      this.support.supporter.image.patchValue(photoURL)
      
      if (this.origin === 'milestone') {
        this.nrOfDotsInSeqno = getNrOfDotsInSeqno(this.milestone.sequenceNumber)
        const milestoneLevel = `path.level${this.nrOfDotsInSeqno + 1}id`
        this.supports$ = this.db.col$(reference, ref => ref.where(milestoneLevel, '==', this.milestone.id))
        if (!!uid) {
          this.mySupports$ = this.db.col$(reference, ref => ref.where(milestoneLevel, '==', this.milestone.id).where('supporter.uid', '==', uid))
        }
      } else {
        this.supports$ = this.db.col$(reference, ref => ref.orderBy('createdAt', 'desc'))
        if (!!uid) {
          this.mySupports$ = this.db.col$(reference, ref => ref.where('supporter.uid', '==', uid).orderBy('createdAt', 'desc'))
        }
      }
    })
  }

  async openLoginModal(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    })
    await modal.present()
  }

  async dismiss(): Promise<void> {
    await this.modalCtrl.dismiss()
  }

  async addSupport(goal: Goal): Promise<void> {

    if (!this.support.description.value) return;

    this.support.goal.id.patchValue(this.goalId)
    this.support.goal.title.patchValue(goal.title)
    this.support.goal.image.patchValue(goal.image)
    if (!!this.milestone) {
      this.support.milestone.id.patchValue(this.milestone.id)
      this.support.milestone.description.patchValue(this.milestone.description)
      await this.determinePath(this.goalId, this.milestone.sequenceNumber, this.support)
    }

    this.supportService.addSupport(this.goalId, this.support.value)
    this.support.reset();

    //Increase number of custom supports
    //IS FIREBASE FUNCTION

    //Set stakeholder as supporter
    // TODO do in firebase functions
    const { uid } = await this.afAuth.currentUser;
    this.goalStakeholder.upsert(uid, this.goalId, { isSupporter: true })

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
