import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { PopoverController } from '@ionic/angular'
import { createGoalStakeholder } from '@strive/model'

export enum enumGoalOptions {
  editNotificationSettings,
  finishGoal,
  editGoal,
  deleteGoal,
  openTeamModal,
  openFocusModal
}

@Component({
  selector: 'journal-goal-options-popover',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalOptionsPopoverComponent {

  public enumGoalOptions = enumGoalOptions

  @Input() stakeholder = createGoalStakeholder()

  constructor(private popoverCtrl: PopoverController) { }

  async close(goalOption: enumGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }
}
