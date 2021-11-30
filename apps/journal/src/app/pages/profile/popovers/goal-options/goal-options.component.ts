import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, NavParams, PopoverController } from '@ionic/angular';
import { Goal, GoalStatus } from '@strive/goal/goal/+state/goal.firestore';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { UpsertPostModal } from '@strive/post/components/upsert-modal/upsert-modal.component';

@Component({
  selector: 'journal-goal-options',
  templateUrl: './goal-options.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalOptions {

  goal: Goal = this.navParams.data.goal;

  constructor(
    private alertCtrl: AlertController,
    private goalService: GoalService,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private popoverCtrl: PopoverController,
    private router: Router
  ) {}

  setStatus(status: GoalStatus) {
    // TODO pop-up when marking as finished

    if (status === 'finished') {
      this.alertCtrl.create({
        header: `Are you sure its finished?`,
        buttons: [
          {
            text: 'Yes',
            handler: async () => {
              await this.goalService.update(this.goal.id, { status: 'finished' })
              this.modalCtrl.create({
                component: UpsertPostModal,
                componentProps: {
                  goal: this.goal,
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
      this.goalService.update({ id: this.goal.id, status })
    }
    this.popoverCtrl.dismiss()
  }

  goTo() {
    this.router.navigate(['/goal/', this.goal.id])
    this.popoverCtrl.dismiss()
  }
}