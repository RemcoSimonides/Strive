import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

// Rxjs
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// Strive Service
import { GoalStakeholderService } from '@strive/goal/stakeholder/+state/stakeholder.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { MilestoneService } from '@strive/milestone/+state/milestone.service';

// Strive Other
import { Milestone } from '@strive/milestone/+state/milestone.firestore';
import { createGoalStakeholder, GoalStakeholder } from '@strive/goal/stakeholder/+state/stakeholder.firestore';
import { Goal } from '@strive/goal/goal/+state/goal.firestore';

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

    this.milestones$ = this.milestone.valueChanges({ goalId: this.goal.id })
  }
}