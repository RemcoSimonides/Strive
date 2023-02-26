import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { orderBy, where } from 'firebase/firestore'
import { Observable } from 'rxjs'
import { createGoalStakeholder, Goal, Milestone } from '@strive/model'
import { MilestoneService } from '@strive/roadmap/milestone.service'

@Component({
  selector: '[goal] strive-goal-slide-4',
  templateUrl: './slide-4.component.html',
  styleUrls: ['./slide-4.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Slide4Component implements OnInit {
  @Input() goal!: Goal

  milestones$?: Observable<Milestone[]>
  stakeholder = createGoalStakeholder({ isAdmin: true, isAchiever: true })

  constructor(
    private milestoneService: MilestoneService
  ) {}

  ngOnInit() {
    this.milestones$ = this.milestoneService.valueChanges([
      where('deletedAt', '==', null),
      orderBy('order', 'asc')
    ], { goalId: this.goal.id })
  }
}