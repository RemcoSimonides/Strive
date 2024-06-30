import { ChangeDetectionStrategy, Component, Input, HostListener } from '@angular/core'
import { AlertController, IonList, IonItem, ModalController, PopoverController } from '@ionic/angular/standalone'

import { GoalService } from '@strive/goal/goal.service'
import { AuthService } from '@strive/auth/auth.service'

import { createGoalStakeholder, createPost, Goal } from '@strive/model'

import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'

export enum enumGoalOptions {
  editNotificationSettings,
  finishGoal,
  editGoal,
  deleteGoal,
  integrateStrava
}

@Component({
  standalone: true,
  selector: 'journal-goal-options-popover',
  templateUrl: './options.component.html',
  styleUrls: ['./options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    IonList,
    IonItem
  ]
})
export class GoalOptionsPopoverComponent {
  @HostListener('window:popstate', ['$event'])
  onPopState() { this.popoverCtrl.dismiss() }

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

  dismiss(data: enumGoalOptions) {
    this.popoverCtrl.dismiss(data)
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
    }).then(alert => alert.present())
  }
}
