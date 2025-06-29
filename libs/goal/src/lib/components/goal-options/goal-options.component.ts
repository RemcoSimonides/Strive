import { ChangeDetectionStrategy, Component, Input, inject } from '@angular/core'
import { Router } from '@angular/router'

import { AlertController, IonList, IonItem, ModalController, PopoverController } from '@ionic/angular/standalone'

import { createPost, Goal, GoalStakeholder } from '@strive/model'
import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'
import { GoalService } from '../../goal.service'
import { AuthService } from '@strive/auth/auth.service'

@Component({
    selector: '[goal][stakeholder] strive-goal-options',
    templateUrl: './goal-options.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        IonList,
        IonItem
    ]
})
export class GoalOptionsComponent {
  private alertCtrl = inject(AlertController);
  private auth = inject(AuthService);
  private goalService = inject(GoalService);
  private modalCtrl = inject(ModalController);
  private popoverCtrl = inject(PopoverController);
  private router = inject(Router);


  @Input() goal!: Goal
  @Input() stakeholder!: GoalStakeholder

  markFinished() {
    if (!this.auth.uid || !this.goal?.id) throw new Error('uid or goal not provided')
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
    this.popoverCtrl.dismiss()
  }

  goTo() {
    this.router.navigate(['/goal/', this.goal?.id])
    this.popoverCtrl.dismiss()
  }

  deleteGoal() {
    this.popoverCtrl.dismiss()
    this.alertCtrl.create({
      subHeader: `Are you sure you want to delete this goal?`,
      message: `This action is irreversible`,
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            this.goalService.remove(this.goal?.id)
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
