import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { orderBy } from 'firebase/firestore';

// Rxjs
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Strive Service
import { GoalStakeholderService } from '@strive/goal/stakeholder/stakeholder.service';
import { UserService } from '@strive/user/user/user.service';
import { MilestoneService } from '@strive/goal/milestone/milestone.service';

// Strive Other
import { Goal, Milestone, createGoalStakeholder, GoalStakeholder } from '@strive/model'

@Component({
  selector: '[goal] journal-goal-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent {

  stakeholder$?: Observable<GoalStakeholder>
  milestones$?: Observable<Milestone[]>

  _goal?: Goal
  private _previousGoalId = ''
  @Input() set goal(goal: Goal) {
    if (!goal) return
    this._goal = goal

    const goalIdChanged = goal.id !== this._previousGoalId
    if (goalIdChanged) {
      this._previousGoalId = goal.id
      this.stakeholder$ = this.user.user$.pipe(
        switchMap(user => user ? this.stakeholderService.valueChanges(user.uid, { goalId: goal.id }) : of(undefined)),
        map(stakeholder => createGoalStakeholder(stakeholder))
      )
  
      const query = [orderBy('order', 'asc')]
      this.milestones$ = this.milestone.valueChanges(query, { goalId: goal.id })
    }
  }

  constructor(
    private milestone: MilestoneService,
    private stakeholderService: GoalStakeholderService,
    private user: UserService
  ) { }
}