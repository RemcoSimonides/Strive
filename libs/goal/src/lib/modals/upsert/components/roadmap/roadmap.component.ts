import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'
import { orderBy, where } from 'firebase/firestore'
import { Observable } from 'rxjs'

import { Goal, Milestone, createGoalStakeholder } from '@strive/model'
import { RoadmapModule } from '@strive/roadmap/components/roadmap/roadmap.module'
import { SuggestionSComponent } from '@strive/ui/suggestion/suggestion.component'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { IsFuturePipe } from '@strive/utils/pipes/date-fns.pipe'

@Component({
  standalone: true,
  selector: '[goal] strive-goal-roadmap',
  templateUrl: './roadmap.component.html',
  styleUrls: ['./roadmap.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RoadmapModule,
    IsFuturePipe,
    SuggestionSComponent
  ]
})
export class GoalRoadmapComponent implements OnInit {

  milestones$?: Observable<Milestone[]>
  stakeholder = createGoalStakeholder({ isAdmin: true, isAchiever: true })

  @Input() goal?: Goal
  @Input() suggestion = ''

  constructor(
    private milestoneService: MilestoneService
  ) {}

  ngOnInit() {
    if (!this.goal) return
    const query = [where('deletedAt', '==', null), orderBy('order', 'asc')]
    this.milestones$ = this.milestoneService.valueChanges(query, { goalId: this.goal.id })
  }

}