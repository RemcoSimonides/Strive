import { Component, Input } from '@angular/core';
// Ionic
import { PopoverController } from '@ionic/angular'
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
export class GoalOptionsPopoverComponent {

  public enumGoalOptions = enumGoalOptions

  @Input() isAdmin = false
  @Input() status?: GoalStatus

  constructor(private popoverCtrl: PopoverController) { }

  async close(goalOption: enumGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }
}
