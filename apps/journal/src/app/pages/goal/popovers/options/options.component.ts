import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { AlertController, ModalController, PopoverController } from '@ionic/angular'

import { GoalService } from '@strive/goal/goal.service'
import { AuthService } from '@strive/auth/auth.service'

import { createGoalStakeholder, createPost, Goal } from '@strive/model'

import { UpsertPostModalComponent } from '@strive/post/modals/upsert/upsert.component'

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
  @Input() goal?: Goal

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController
  ) { }

  async close(goalOption: enumGoalOptions){
    this.popoverCtrl.dismiss(goalOption)
  }

  markAsFinished() {
    if (!this.auth.uid || !this.goal) throw new Error('uid or goal not provided')
    this.popoverCtrl.dismiss()
    this.alertCtrl.create({
      header: `Are you sure its finished?`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            if (!this.auth.uid || !this.goal?.id) throw new Error('uid or goal not provided')
            this.goalService.update({
              id: this.goal.id,
              status: 'succeeded'
            })
            this.modalCtrl.create({
              component: UpsertPostModalComponent,
              componentProps: {
                post: createPost({
                  id: this.goal.id,
                  goalId: this.goal.id
                })
              }
            }).then(modal => modal.present())
          }
        },
        {
          text: 'No',
          role: 'cancel'
        }
      ]
    })
  }
}
