import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core'
import { PopoverController } from '@ionic/angular'
// import { isPast } from 'date-fns'

import { GoalForm } from '@strive/goal/forms/goal.form'
import { DeadlinePopoverSComponent } from '@strive/goal/popovers/deadline/deadline.component'

@Component({
  selector: '[form] strive-goal-slide-1',
  templateUrl: './slide-1.component.html',
  styleUrls: ['./slide-1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide1Component {
  @Input() form!: GoalForm

  constructor(
    private cdr: ChangeDetectorRef,
    private popoverCtrl: PopoverController
  ) {}

  async openDatePicker() {
    const caption = 'Is the goal already finished? Pick the date when it was'

    const popover = await this.popoverCtrl.create({
      component: DeadlinePopoverSComponent,
      componentProps: { caption }
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

  // toggle(event: ToggleCustomEvent) {
  //   this.hasFocus.emit(event.detail.checked)
  // }

  // isOverdue(date: Date) {
  //   return isPast(date)
  // }
}