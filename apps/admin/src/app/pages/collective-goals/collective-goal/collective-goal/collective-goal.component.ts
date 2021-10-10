import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CollectiveGoal } from '@strive/collective-goal/collective-goal/+state/collective-goal.firestore';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';
import { CollectiveGoalForm } from '@strive/collective-goal/collective-goal/forms/collective-goal.form';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: '[id] strive-collective-goal',
  templateUrl: './collective-goal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectiveGoalComponent implements OnInit {

  collectiveGoal$: Observable<CollectiveGoal>
  collectiveGoalForm = new CollectiveGoalForm()

  @Input() id: string

  constructor(
    private collectiveGoal: CollectiveGoalService
  ) {}

  ngOnInit() {
    this.collectiveGoal$ = this.collectiveGoal.valueChanges(this.id).pipe(
      tap(collectiveGoal => this.collectiveGoalForm.patchValue(collectiveGoal))
    )
  }

  update() {
    if (this.collectiveGoalForm.invalid) {
      console.error('invalid form')
      return
    }

    this.collectiveGoal.update({ ...this.collectiveGoalForm.value, id: this.id })
  }
}
