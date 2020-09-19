import { Component, OnInit } from '@angular/core';
// Ionic
import { PopoverController, NavParams } from '@ionic/angular'
// Services
import { GoalStakeholderService } from 'apps/journal/src/app/services/goal/goal-stakeholder.service';
// Interfaces
import { enumGoalPublicity } from '@strive/interfaces';

@Component({
  selector: 'app-goal-options-popover',
  templateUrl: './goal-options-popover.page.html',
  styleUrls: ['./goal-options-popover.page.scss'],
})
export class GoalOptionsPopoverPage implements OnInit {

  public enumGoalOptions = enumGoalOptions
  public enumGoalPublicity = enumGoalPublicity

  public _isAdmin: boolean = false
  public _publicity: enumGoalPublicity
  public _isFinished: boolean = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController,
    public stakeholderService: GoalStakeholderService
  ) { }

  ngOnInit() {
    this._isAdmin = this.navParams.data.isAdmin
    this._publicity = this.navParams.data.publicity
    this._isFinished = this.navParams.data.isFinished
  }

  async close(goalOption: enumGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }

}

export enum enumGoalOptions {
  EditNotificationSettings,
  DuplicateGoal,
  FinishGoal,
  editGoal,
  deleteGoal
}