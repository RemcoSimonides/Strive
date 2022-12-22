import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core'
import { Location } from '@angular/common'
import { AlertController, LoadingController, NavParams, PopoverController } from '@ionic/angular'
import { addYears, endOfYear, startOfYear } from 'date-fns'
import { createGoal } from '@strive/model'
import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalForm } from '@strive/goal/goal/forms/goal.form'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'

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
    private cdr: ChangeDetectorRef,
    private goal: GoalService,
    private loadingCtrl: LoadingController,
    private location: Location,
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

        const goal = createGoal({ ...this.form.getGoalValue(), id: this.goalId })
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

  deadlineSelect(value: '1' | 'end0' | 'end1' | '3' | '10' | 'custom') {
    const now = new Date()
    switch (value) {
      case '1': {
        this.form.deadline.setValue(addYears(now, 1))
        break
      }
      case 'end0': {
        const date = endOfYear(now)
        this.form.deadline.setValue(date)
        break
      }
      case 'end1': {
        const date = endOfYear(addYears(now, 1))
        this.form.deadline.setValue(date)
        break
      }
      case '3': {
        this.form.deadline.setValue(addYears(now, 3))
        break
      }
      case '10': {
        this.form.deadline.setValue(addYears(now, 10))
        break
      }
      case 'custom': {
        this.openDatePicker()
        break
      }
      default:
        throw new Error('invalid option selected')
    }
  }

  async openDatePicker() {
    const minDate = startOfYear(addYears(new Date(), -100))
    const maxDate = endOfYear(addYears(new Date(), 1000))

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { minDate, maxDate, showRemove: false }
    })
    popover.onDidDismiss().then(({ data, role }) => {
      if (role === 'remove') {
        this.form.deadline.setValue(new Date())
        this.form.deadline.markAsDirty()
      } else if (role === 'dismiss') {
        const date = new Date(data ?? new Date())
        this.form.deadline.setValue(date)
        this.form.deadline.markAsDirty()
      }
      this.cdr.markForCheck()
    })
    popover.present()
  }
}