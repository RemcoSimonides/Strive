import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core'
import { NavParams, PopoverController, ToggleCustomEvent } from '@ionic/angular'
import { addYears, endOfYear, isPast, startOfYear } from 'date-fns'
import { createGoal } from '@strive/model'
import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalForm } from '@strive/goal/goal/forms/goal.form'
import { DatetimeComponent } from '@strive/ui/datetime/datetime.component'

@Component({
  selector: '[form][goalId] goal-slide-1',
  templateUrl: './slide-1.component.html',
  styleUrls: ['./slide-1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide1Component {
  @Input() form!: GoalForm
  @Input() goalId!: string

  @Output() stepper = new EventEmitter<'next' | 'previous'>()
  @Output() created = new EventEmitter<boolean>()
  @Output() hasFocus = new EventEmitter<boolean>()

  constructor(
    private cdr: ChangeDetectorRef,
    private goal: GoalService,
    private navParams: NavParams,
    private popoverCtrl: PopoverController
  ) {}

  async next() {
    this.stepper.next('next')

    if (this.form.dirty) {
      const goal = createGoal({ ...this.form.getGoalValue(), id: this.goalId })
      if (isPast(goal.deadline)) goal.status = 'succeeded'

      this.goal.upsert(goal, { params: { uid: this.navParams.data?.['uid'] }})
      this.created.emit(true)
      this.form.markAsPristine()
    }
  }

  toggle(event: ToggleCustomEvent) {
    this.hasFocus.emit(event.detail.checked)
  }

  async openDatePicker(event: Event) {
    event.stopPropagation()

    const minDate = startOfYear(addYears(new Date(), -100))
    const maxDate = endOfYear(addYears(new Date(), 1000))
    const caption = 'Is the goal already finished? Pick the date when it was'

    const popover = await this.popoverCtrl.create({
      component: DatetimeComponent,
      componentProps: { minDate, maxDate, caption, showRemove: false }
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

  isOverdue(date: Date) {
    return isPast(date)
  }

}