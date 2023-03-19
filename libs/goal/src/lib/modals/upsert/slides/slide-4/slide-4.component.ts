import { ChangeDetectionStrategy, Component, Input, OnDestroy, OnInit } from '@angular/core'
import { orderBy, where } from 'firebase/firestore'
import { Observable, Subscription } from 'rxjs'
import { createGoal, createGoalStakeholder, Milestone } from '@strive/model'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { GoalForm } from '@strive/goal/forms/goal.form'

@Component({
  selector: '[goalId][form] strive-goal-slide-4',
  templateUrl: './slide-4.component.html',
  styleUrls: ['./slide-4.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide4Component implements OnInit, OnDestroy {
  @Input() suggestion = ''
  @Input() goalId!: string
  @Input() form!: GoalForm

  goal = createGoal()
  milestones$?: Observable<Milestone[]>
  stakeholder = createGoalStakeholder({ isAdmin: true, isAchiever: true })
  sub?: Subscription

  constructor(
    private milestoneService: MilestoneService
  ) {}

  ngOnInit() {
    this.milestones$ = this.milestoneService.valueChanges([
      where('deletedAt', '==', null),
      orderBy('order', 'asc')
    ], { goalId: this.goalId })

    this.sub = this.form.valueChanges.subscribe(goal => {
      this.goal = createGoal({
        id: this.goalId,
        ...goal
      })
    })
  }

  ngOnDestroy() {
    this.sub?.unsubscribe()
  }
}