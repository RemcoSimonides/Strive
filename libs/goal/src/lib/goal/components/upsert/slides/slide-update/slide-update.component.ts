import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Location } from '@angular/common';
import { AlertController, LoadingController, NavParams } from '@ionic/angular';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { createGoal, GoalPublicityType } from '@strive/goal/goal/+state/goal.firestore';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';

@Component({
  selector: 'slide-update',
  templateUrl: './slide-update.component.html',
  styleUrls: ['./slide-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideUpdate {
  @Input() form: GoalForm
  @Input() goalId: string

  constructor(
    private alertCtrl: AlertController,
    private collectiveGoal: CollectiveGoalService,
    private goal: GoalService,
    private loadingCtrl: LoadingController,
    private location: Location,
    private navParams: NavParams
  ) {}

  async save() {
    if (!this.form.valid) {
      console.log('invalid value(s)')
    } else {

      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Please wait...'
      })
      loading.present()

      try {
        const publicity = await this.determinePublicity()
        this.form.publicity.setValue(publicity)

        const goal = createGoal({ ...this.form.value, id: this.goalId })
        delete goal['isSecret'] // remove isSecret value from Form

        await this.goal.upsert(goal, { params: { uid: this.navParams.data?.uid }})

        this.location.back()
        loading.dismiss()

      } catch (error) {
        loading.dismiss()
        this.alertCtrl.create({
          message: error.message,
          buttons: ['Ok']
        }).then(alert => alert.present())
      }
    }
  }

  private async determinePublicity(): Promise<GoalPublicityType> {
    if (this.form.isSecret.value) return 'private'

    const collectiveGoalId = this.navParams.data.collectiveGoalId as string
    if (collectiveGoalId) {
      this.form.collectiveGoalId.setValue(collectiveGoalId)
      const collectiveGoal = await this.collectiveGoal.getValue(collectiveGoalId)
      if (collectiveGoal?.isSecret) return 'collectiveGoalOnly';
    }

    return 'public'
  }
}