import { Component, OnInit } from '@angular/core';
import { PopoverController, NavParams } from '@ionic/angular';
// Services
import { MilestoneService } from 'apps/journal/src/app/services/milestone/milestone.service';
import { UserService } from '@strive/user/user/+state/user.service';
// Interfaces
import { Milestone, enumMilestoneStatus } from '@strive/milestone/+state/milestone.firestore'

@Component({
  selector: 'app-milestone-options',
  templateUrl: './milestone-options.page.html',
  styleUrls: ['./milestone-options.page.scss'],
})
export class MilestoneOptionsPage implements OnInit {

  _goalId: string
  _milestone: Milestone

  _isNotCompleted: boolean
  _isAlreadyAssigned: boolean

  public enumMilestoneStatus = enumMilestoneStatus

  constructor(
    private user: UserService,
    private _milestoneService: MilestoneService,
    private _navParams: NavParams,
    private _popoverCtrl: PopoverController
  ) { }

  async ngOnInit() {
    this._goalId = this._navParams.get('goalId')
    this._milestone = this._navParams.get('milestone')

    if (this._milestone.achiever.uid ===  this.user.uid) {
      this._isAlreadyAssigned = true
    } else this._isAlreadyAssigned = false

    if (this._milestone.status === enumMilestoneStatus.pending || this._milestone.status === enumMilestoneStatus.overdue) {
      this._isNotCompleted = true
    } else this._isNotCompleted = false

  }

  dismiss(data) {
    console.log('dimissed data', data)
    this._popoverCtrl.dismiss(data)
  }

  complete() {
    this.dismiss({
      statusChange: true
    })
  }

  setDeadline() {
    this.dismiss({
      setDeadline: true
    })
  }

  removeDeadline() {
    this.dismiss({
      removeDeadline: true
    })
  }

  async assignMe(): Promise<void> {
    const currentUser = await this.user.getFirebaseUser();
    await this._milestoneService.assignCurrentUser(this._goalId, this._milestone)
    this._milestone.achiever.uid = currentUser.uid
    this._milestone.achiever.username = currentUser.displayName
    this._milestone.achiever.photoURL = currentUser.photoURL

    this.dismiss(this._milestone)

  }

  async unassignMe(): Promise<void> {

    await  this._milestoneService.unassignAchiever(this._goalId, this._milestone)
    this._milestone.achiever.uid = null
    this._milestone.achiever.username = null
    this._milestone.achiever.photoURL = null

    this.dismiss(this._milestone)

  }

}
