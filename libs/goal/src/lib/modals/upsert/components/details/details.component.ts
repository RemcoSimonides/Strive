import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonList, IonItem, IonLabel, IonInput, IonSelect, IonSelectOption, PopoverController } from '@ionic/angular/standalone'
import { GoalForm } from '@strive/goal/forms/goal.form'
import { DeadlinePopoverComponent } from '@strive/goal/popovers/deadline/deadline.component'
import { endOfDay } from 'date-fns'

@Component({
  standalone: true,
  selector: '[form] strive-goal-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DeadlinePopoverComponent,
    IonList,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption
  ]
})
export class GoalDetailsComponent {

  @Input() form?: GoalForm

  constructor(
    private cdr: ChangeDetectorRef,
    private popoverCtrl: PopoverController
  ) { }

  async openDatePicker() {
    const caption = 'Is the goal already finished? Pick the date when it was'

    const popover = await this.popoverCtrl.create({
      component: DeadlinePopoverComponent,
      componentProps: { caption }
    })
    popover.onDidDismiss().then(({ data }) => {
      if (data && this.form) {
        this.form.deadline.setValue(endOfDay(data))
        this.form.deadline.markAsDirty()
      }
      this.cdr.markForCheck()
    })
    popover.present()
  }
}
