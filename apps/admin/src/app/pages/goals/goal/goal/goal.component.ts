import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';
import { GoalService } from '@strive/goal/goal/+state/goal.service';
import { GoalForm } from '@strive/goal/goal/forms/goal.form';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: '[id] strive-goal',
  templateUrl: './goal.component.html',
  styleUrls: ['./goal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalComponent implements OnInit {

  goal$: Observable<Goal>
  goalForm = new GoalForm()

  @Input() id: string

  constructor(
    private goal: GoalService
  ) {}

  ngOnInit() {
    this.goal$ = this.goal.valueChanges(this.id).pipe(
      tap(goal => this.goalForm.patchValue(goal))
    )
  }

  update() {
    if (this.goalForm.invalid) {
      console.error('invalid form')
      return
    }

    this.goal.update({ ...this.goalForm.value, id: this.id })
  }
}
