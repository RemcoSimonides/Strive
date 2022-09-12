import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { createGoal } from '@strive/model'
import { GoalService } from '@strive/goal/goal/goal.service';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';

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
  @Output() focus = new EventEmitter<boolean>()

  constructor(
    private goal: GoalService,
    private navParams: NavParams
  ) {}

  async next() {
    this.stepper.next('next')

    if (this.form.dirty) {
      const goal = createGoal({ ...this.form.getGoalValue(), id: this.goalId })
    
      this.goal.upsert(goal, { params: { uid: this.navParams.data?.['uid'] }})
      this.created.emit(true)
      this.form.markAsPristine()
    }
  }

  toggle(event: any) {
    this.focus.emit(event.detail.checked)
  }

}