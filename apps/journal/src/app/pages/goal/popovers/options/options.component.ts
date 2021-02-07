import { Component, OnInit } from '@angular/core';
// Ionic
import { PopoverController, NavParams } from '@ionic/angular'

export enum enumGoalOptions {
  editNotificationSettings,
  duplicateGoal,
  finishGoal,
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

  public isAdmin = false
  public isFinished = false

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {
    this.isAdmin = this.navParams.data.isAdmin
    this.isFinished = this.navParams.data.isFinished
  }

  async close(goalOption: enumGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }
}
