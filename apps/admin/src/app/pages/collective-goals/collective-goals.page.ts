import { ChangeDetectionStrategy, Component } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
import { CollectiveGoalService } from '@strive/collective-goal/collective-goal/+state/collective-goal.service';

@Component({
  selector: 'strive-collective-goals',
  templateUrl: './collective-goals.page.html',
  styleUrls: ['./collective-goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectiveGoalsPage {
  collectiveGoals$ = this.collectiveGoal.valueChanges([orderBy('createdAt', 'desc')])
  
  constructor(private collectiveGoal: CollectiveGoalService) {}
}
