import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { NavParams } from '@ionic/angular';
import { createGoal, GoalPublicityType } from '@strive/model'
import { GoalService } from '@strive/goal/goal/goal.service';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';

@Component({
  selector: 'goal-slide-1',
  templateUrl: './slide-1.component.html',
  styleUrls: ['./slide-1.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide1Component {
  @Input() form: GoalForm
  @Input() goalId: string

  @Output() stepper = new EventEmitter<'next' | 'previous'>()

  constructor(
    private goal: GoalService,
    private navParams: NavParams
  ) {}

  async next() {
    this.stepper.next('next')
    const publicity = await this.determinePublicity()
    this.form.publicity.setValue(publicity)

    if (this.form.dirty) {
      const goal = createGoal({ ...this.form.value, id: this.goalId })
      delete goal['isSecret'] // remove isSecret value from Form
    
      this.goal.upsert(goal, { params: { uid: this.navParams.data?.uid }})
      this.form.markAsPristine()
    }
  }

  private async determinePublicity(): Promise<GoalPublicityType> {
    if (this.form.isSecret.value) return 'private'

    return 'public'
  }
}