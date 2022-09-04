import { Component, Input } from '@angular/core'
import { PopoverController } from '@ionic/angular'

export enum enumGoalOptions {
  editNotificationSettings,
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

  constructor(private popoverCtrl: PopoverController) { }

  async close(goalOption: enumGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }
}
