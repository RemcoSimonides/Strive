import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewChild } from '@angular/core'
import { AlertController, LoadingController, NavParams, PopoverController } from '@ionic/angular'
import { GoalService } from '@strive/goal/goal.service'
import { GoalForm } from '@strive/goal/forms/goal.form'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { DeadlinePopoverSComponent } from '@strive/goal/popovers/deadline/deadline.component'

@Component({
  selector: '[form][goalId] strive-goal-slide-update',
  templateUrl: './slide-update.component.html',
  styleUrls: ['./slide-update.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SlideUpdateComponent {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent
  
  @Input() form!: GoalForm
  @Input() goalId!: string

  @Output() saved = new EventEmitter()

  constructor(
    private alertCtrl: AlertController,
    private cdr: ChangeDetectorRef,
    private goal: GoalService,
    private loadingCtrl: LoadingController,
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) {}

  async save() {
    if (!this.form.valid) {
      console.log('invalid value(s)')
    } else {

      const loading = await this.loadingCtrl.create({
        spinner: 'lines',
        message: 'Saving...'
      })
      loading.present()

      try {
        if (this.imageSelector?.step.value === 'crop') {
          this.imageSelector.cropIt()
        }

        const goal = { ...this.form.getGoalValue(), id: this.goalId }
        await this.goal.upsert(goal, { params: { uid: this.navParams.data?.['uid'] }})

        this.saved.emit()
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

  async openDatePicker() {
    const popover = await this.popoverCtrl.create({
      component: DeadlinePopoverSComponent
    })
    popover.onDidDismiss().then(({ data }) => {
      if (data) {
        this.form.deadline.setValue(data)
        this.form.deadline.markAsDirty()
      }
      this.cdr.markForCheck()
    })
    popover.present()
  }
}