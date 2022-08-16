import { ChangeDetectionStrategy, Component, Input, ViewChild } from '@angular/core';
import { Location } from '@angular/common';
import { AlertController, LoadingController, NavParams } from '@ionic/angular';
import { createGoal, GoalPublicityType } from '@strive/model'
import { GoalService } from '@strive/goal/goal/goal.service';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component';

@Component({
  selector: '[form][goalId] goal-slide-update',
  templateUrl: './slide-update.component.html',
  styleUrls: ['./slide-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideUpdateComponent {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent
  
  @Input() form!: GoalForm
  @Input() goalId!: string

  constructor(
    private alertCtrl: AlertController,
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
        if (this.imageSelector?.step.value === 'crop') {
          this.imageSelector.cropIt()
        }

        const publicity = await this.determinePublicity()
        this.form.publicity.setValue(publicity)

        const goal = createGoal({ ...this.form.value, id: this.goalId })
        delete (goal as any)['isSecret'] // remove isSecret value from Form

        await this.goal.upsert(goal, { params: { uid: this.navParams.data?.['uid'] }})

        this.location.back()
        loading.dismiss()

      } catch (error: any) {
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

    return 'public'
  }
}