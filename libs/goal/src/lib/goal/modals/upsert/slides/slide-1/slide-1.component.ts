import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core'
import { NavParams, PopoverController, ToggleCustomEvent } from '@ionic/angular'
import { isPast } from 'date-fns'
import { createGoal } from '@strive/model'
import { GoalService } from '@strive/goal/goal/goal.service'
import { GoalForm } from '@strive/goal/goal/forms/goal.form'
import { DeadlinePopoverSComponent } from '@strive/goal/goal/popovers/deadline/deadline.component'

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

  isOverdue(date: Date) {
    return isPast(date)
  }
}