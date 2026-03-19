import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, inject } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, PopoverController } from '@ionic/angular/standalone'
import { GoalForm } from '@strive/goal/forms/goal.form'
import { DeadlinePopoverComponent } from '@strive/goal/popovers/deadline/deadline.component'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'
import { categories } from '@strive/model'
import { addYears, endOfDay, endOfYear, startOfYear } from 'date-fns'

@Component({
    selector: '[form] strive-goal-details',
    templateUrl: './details.component.html',
    styleUrls: ['./details.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        IonList,
        IonItem,
        IonLabel,
        IonInput,
        IonSelect,
        IonSelectOption
    ]
})
export class GoalDetailsComponent {
  private cdr = inject(ChangeDetectorRef);
  private popoverCtrl = inject(PopoverController);


  @Input() form?: GoalForm
  @Input() mode?: 'create' | 'update'

  categories = categories

  async openDatePicker() {
    const caption = 'Is the goal already finished? Pick the date when it was'

    const popover = await this.popoverCtrl.create({
      component: DeadlinePopoverComponent,
      componentProps: { caption }
    })
    await popover.present()
    const { data, role } = await popover.onDidDismiss()

    if (role === 'custom') {
      this.openCustomDatePicker(caption)
    } else if (data && this.form) {
      this.form.deadline.setValue(endOfDay(data))
      this.form.deadline.markAsDirty()
      this.cdr.markForCheck()
    }
  }

  private async openCustomDatePicker(caption: string) {
    const minDate = startOfYear(addYears(new Date(), -100))
    const maxDate = endOfYear(addYears(new Date(), 1000))

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { minDate, maxDate, showRemove: false, caption, width: '300px' },
      cssClass: 'datetime-popover'
    })
    await popover.present()
    const { data, role } = await popover.onDidDismiss()

    if (role === 'dismiss' && this.form) {
      const date = data ? new Date(data) : new Date()
      this.form.deadline.setValue(endOfDay(date))
      this.form.deadline.markAsDirty()
      this.cdr.markForCheck()
    }
  }
}
