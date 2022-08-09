import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { GoalService } from '@strive/goal/goal/goal.service';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';

@Component({
  selector: '[form][goalId] goal-slide-3',
  templateUrl: './slide-3.component.html',
  styleUrls: ['./slide-3.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide3Component {
  @Input() form!: GoalForm
  @Input() goalId!: string

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  constructor(private goal: GoalService) {}

  step(direction: 'next' | 'previous') {
    if (this.form.image.dirty) {
      this.goal.upsert({ id: this.goalId, image: this.form.image.value })
      this.form.image.markAsPristine()
    }
    this.stepper.emit(direction)
  }
}