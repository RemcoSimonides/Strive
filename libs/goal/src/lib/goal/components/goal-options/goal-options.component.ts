import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavParams, PopoverController } from '@ionic/angular';
import { Goal, GoalStatus } from '@strive/model'
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { UpsertPostModalComponent } from '@strive/post/components/upsert-modal/upsert-modal.component';
import { GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';

@Component({
  selector: 'journal-goal-options',
  templateUrl: './goal-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalOptionsComponent {

  goal: Goal = this.navParams.data.goal;
  stakeholder: GoalStakeholder = this.navParams.data.stakeholder;

  constructor(
    private alertCtrl: AlertController,
    private goalStakeholderService: GoalStakeholderService,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private popoverCtrl: PopoverController,
    private router: Router,
    private user: UserService
  ) {}

  setStatus(status: GoalStatus) {
    if (status === 'finished') {
      this.alertCtrl.create({
        header: `Are you sure its finished?`,
        buttons: [
          {
            text: 'Yes',
            handler: async () => {
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
      this.goalStakeholderService.update({ uid: this.user.uid, status }, { params: { goalId: this.goal.id }})
    }
    this.popoverCtrl.dismiss()
  }

  goTo() {
    this.router.navigate(['/goal/', this.goal.id])
    this.popoverCtrl.dismiss()
  }
}