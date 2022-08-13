import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, PopoverController } from '@ionic/angular';
import { Goal, GoalStatus, GoalStakeholder } from '@strive/model'
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { UserService } from '@strive/user/user/user.service';
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { GoalService } from '../../goal.service';

@Component({
  selector: '[goal][stakeholder] journal-goal-options',
  templateUrl: './goal-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalOptionsComponent {

  @Input() goal!: Goal
  @Input() stakeholder!: GoalStakeholder

  constructor(
    private alertCtrl: AlertController,
    private goalService: GoalService,
    private goalStakeholderService: GoalStakeholderService,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router,
    private user: UserService
  ) {}

  setStatus(status: GoalStatus) {
    if (!this.user.uid || !this.goal?.id) throw new Error('uid or goal not provided')
    if (status === 'finished') {
      this.alertCtrl.create({
        header: `Are you sure its finished?`,
        buttons: [
          {
            text: 'Yes',
            handler: async () => {
              if (!this.user.uid || !this.goal?.id) throw new Error('uid or goal not provided')
              await this.goalStakeholderService.update({ uid: this.user.uid, status: 'finished' }, { params: { goalId: this.goal.id }})
              this.modalCtrl.create({
                component: UpsertPostModalComponent,
                componentProps: {
                  goalId: this.goal.id,
                  postId: this.goal.id
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
    } else {
      this.goalStakeholderService.update({ uid: this.user.uid, status }, { params: { goalId: this.goal?.id }})
    }
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