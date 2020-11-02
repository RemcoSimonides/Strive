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
import { SupportService } from 'apps/journal/src/app/services/support/support.service'
// Interfaces
import { IMilestone, ISupport } from '@strive/interfaces'
import { Goal } from '@strive/goal/goal/+state/goal.firestore'
// Components
import { AuthModalPage, enumAuthSegment } from 'apps/journal/src/app/pages/auth/auth-modal.page';

@Component({
  selector: 'app-add-support-modal',
  templateUrl: './add-support-modal.page.html',
  styleUrls: ['./add-support-modal.page.scss'],
})
export class AddSupportModalPage implements OnInit {

  public _isLoggedIn: boolean
  public _originIsGoal: boolean

  private _goalId: string
  public _goalDocObs: Observable<Goal>

  public _milestone: IMilestone
  public _nrOfDotsInSeqno: number // used in html

  public _supportColObs: Observable<ISupport[]>
  public _mySupportColObs: Observable<ISupport[]>
  public _support: string = '' // Value in text field

  constructor(
    private afAuth: AngularFireAuth,
    private db: FirestoreService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private goalStakeholder: GoalStakeholderService,
    private supportService: SupportService,
  ) { }

  ngOnInit() {

    this._goalId = this.navParams.get('goalId')
    this._milestone = this.navParams.get('milestone')

    this.afAuth.authState.subscribe(authState => {
      this._isLoggedIn = authState ? true : false
      this.initPage()
    })

  }

  async initPage(): Promise<void> {

    const { uid } = await this.afAuth.currentUser

    if (this._milestone) {
      this._originIsGoal = false
      this._nrOfDotsInSeqno = (this._milestone.sequenceNumber.match(/\./g) || []).length
    } else {
      this._originIsGoal = true
      this._nrOfDotsInSeqno = 0
    }

    this._goalDocObs = this.goalService.getGoalDocObs(this._goalId)
    if (this._originIsGoal) { //Goal

      this._supportColObs = this.db.col$(`Goals/${this._goalId}/Supports`, ref => ref.orderBy('createdAt', 'desc'))
      if (this._isLoggedIn) {
        this._mySupportColObs = this.db.col$(`Goals/${this._goalId}/Supports`, ref => ref.where('supporter.uid', '==', uid).orderBy('createdAt', 'desc'))
      }

    } else { //Milestone

      let milestoneLevel: string

      switch ((this._milestone.sequenceNumber.match(/\./g) || []).length) {
        case 2: {
          milestoneLevel = 'path.level3id'
          break
        }
        case 1: {
          milestoneLevel = 'path.level2id'
          break
        }
        case 0: {
          milestoneLevel = 'path.level1id'
          break
        }
      }

      this._supportColObs = this.db.col$(`Goals/${this._goalId}/Supports`, ref => ref.where(milestoneLevel, '==', this._milestone.id))
      if (this._isLoggedIn) {
        this._mySupportColObs = this.db.col$(`Goals/${this._goalId}/Supports`, ref => ref.where(milestoneLevel, '==', this._milestone.id).where('supporter.uid', '==', uid))
      }

    }

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

  async addSupport(): Promise<void> {

    if (this._support === '') return

    if (this._originIsGoal) {
      await this.addCustomSupportToGoal()
    } else {
      await this.addCustomSupportToMilestone()
    }

    this._support = ''

  }

  private async addCustomSupportToGoal(): Promise<void> {

    const goal = await this.goalService.getGoal(this._goalId)

    //Create support object
    this.supportService.createCustomGoalSupport(goal, this._support)

    //Increase number of custom supports
    //IS FIREBASE FUNCTION

    //Set stakeholder as supporter
    const { uid } = await this.afAuth.currentUser;
    this.goalStakeholder.upsert(uid, this._goalId, { isSupporter: true })

    //Send notification to achievers of goal
    //IS FIREBASE FUNCTION

  }

  private async addCustomSupportToMilestone(): Promise<void> {

    const goal = await this.goalService.getGoal(this._goalId)

    //Create support object
    this.supportService.createCustomMilestoneSupport(goal, this._milestone, this._support)

    //Increase number of custom supports
    //IS FIREBASE FUNCTION

    //Set stakeholder as supporter
    const { uid } = await this.afAuth.currentUser;
    this.goalStakeholder.upsert(uid, this._goalId, { isSupporter: true })

    //Send notification to achievers of goal
    //IS FIREBASE NOT YET A FUNCTION

  }

}
