import { ChangeDetectionStrategy, Component, Input, HostListener, inject } from '@angular/core'
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
  integrations,
  editReminders
}

@Component({
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
  private alertCtrl = inject(AlertController);
  private auth = inject(AuthService);
  private goalService = inject(GoalService);
  private modalCtrl = inject(ModalController);
  private popoverCtrl = inject(PopoverController);

  @HostListener('window:popstate')
  onPopState() { this.popoverCtrl.dismiss() }

  public enumGoalOptions = enumGoalOptions

  @Input() stakeholder = createGoalStakeholder()
  @Input() goal?: Goal


  dismiss(data: enumGoalOptions) {
    this.popoverCtrl.dismiss(data)
  }

  markAsFinished() {
    const uid = this.auth.uid()
    if (!uid || !this.goal) throw new Error('uid or goal not provided')
    this.popoverCtrl.dismiss()
    this.alertCtrl.create({
      header: `Are you sure its finished?`,
      buttons: [
        {
          text: 'Yes',
          handler: async () => {
            if (!uid || !this.goal?.id) throw new Error('uid or goal not provided')
            this.goalService.update(this.goal.id, {
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
