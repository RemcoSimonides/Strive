import { ChangeDetectionStrategy, Component } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
import { GoalService } from '@strive/goal/goal/+state/goal.service';

@Component({
  selector: 'strive-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GoalsPage {

  goals$ = this.goal.valueChanges([orderBy('createdAt', 'desc')]);

  constructor(private goal: GoalService) {}
}
