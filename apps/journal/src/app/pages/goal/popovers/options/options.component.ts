import { Component, OnInit } from '@angular/core';
// Ionic
import { PopoverController, NavParams } from '@ionic/angular'
// Services
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';

export enum enumGoalOptions {
  EditNotificationSettings,
  DuplicateGoal,
  FinishGoal,
  editGoal,
  deleteGoal
}

@Component({
  selector: 'app-goal-options-popover',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class GoalOptionsPopoverPage implements OnInit {

  public enumGoalOptions = enumGoalOptions

  public _isAdmin: boolean = false
  public _isFinished: boolean = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController,
    public stakeholderService: GoalStakeholderService
  ) { }

  ngOnInit() {
    this._isAdmin = this.navParams.data.isAdmin
    this._isFinished = this.navParams.data.isFinished
  }

  async close(goalOption: enumGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }

}
