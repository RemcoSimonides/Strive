import { Component, OnInit } from '@angular/core';
// Ionic
import { PopoverController, NavParams } from '@ionic/angular'
import { GoalStatus } from '@strive/model'

export enum enumGoalOptions {
  editNotificationSettings,
  // duplicateGoal,
  finishGoal,
  editGoal,
  deleteGoal
}

@Component({
  selector: 'journal-goal-options-popover',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
})
export class GoalOptionsPopoverComponent implements OnInit {

  public enumGoalOptions = enumGoalOptions

  public isAdmin = false
  public status: GoalStatus

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.data.isAdmin
    this.status = this.navParams.data.status
  }

  async close(goalOption: enumGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }
}
