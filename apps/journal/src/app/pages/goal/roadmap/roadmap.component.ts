import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { orderBy } from '@angular/fire/firestore';
// Rxjs
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Strive Service
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { MilestoneService } from '@strive/goal/milestone/+state/milestone.service';

// Strive Other
import { Milestone } from '@strive/goal/milestone/+state/milestone.firestore';
import { createGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Goal } from '@strive/model'

@Component({
  selector: '[goal] journal-goal-roadmap',
  templateUrl: 'roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RoadmapComponent implements OnInit {

  stakeholder$: Observable<GoalStakeholder>
  milestones$: Observable<Milestone[]>

  @Input() goal: Goal

  constructor(
    private milestone: MilestoneService,
    private stakeholderService: GoalStakeholderService,
    private user: UserService
  ) { }

  ngOnInit() {
    this.stakeholder$ = this.user.user$.pipe(
      switchMap(user => user ? this.stakeholderService.valueChanges(user.uid, { goalId: this.goal.id }) : of(undefined)),
      map(stakeholder => createGoalStakeholder(stakeholder))
    )

    const query = [orderBy('order', 'asc')]
    this.milestones$ = this.milestone.valueChanges(query, { goalId: this.goal.id })
  }
}