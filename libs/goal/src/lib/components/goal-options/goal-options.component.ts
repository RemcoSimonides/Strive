import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { Router } from '@angular/router'
import { AlertController, ModalController, PopoverController } from '@ionic/angular'
import { createPost, Goal, GoalStakeholder } from '@strive/model'
import { UpsertPostModalComponent } from '@strive/post/modals/upsert/post-upsert.component'
import { GoalService } from '../../goal.service'
import { AuthService } from '@strive/auth/auth.service'

@Component({
  selector: '[goal][stakeholder] strive-goal-options',
  templateUrl: './goal-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalOptionsComponent {

  @Input() goal!: Goal
  @Input() stakeholder!: GoalStakeholder

  constructor(
    private alertCtrl: AlertController,
    private auth: AuthService,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router
  ) {}

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