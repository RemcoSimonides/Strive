import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, ElementRef, Input, OnInit } from '@angular/core'
import { orderBy, where } from 'firebase/firestore'
import { Observable, tap } from 'rxjs'

import { Goal, Milestone, createGoalStakeholder } from '@strive/model'
import { RoadmapComponent } from '@strive/roadmap/components/roadmap/roadmap.component'
import { SuggestionComponent } from '@strive/ui/suggestion/suggestion.component'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { IsFuturePipe } from '@strive/utils/pipes/date-fns.pipe'
import { ScrollService } from '@strive/utils/services/scroll.service'
import { IonContent } from '@ionic/angular/standalone'

@Component({
    selector: '[goal] strive-goal-roadmap',
    templateUrl: './roadmap.component.html',
    styleUrls: ['./roadmap.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        SuggestionComponent,
        RoadmapComponent,
        IsFuturePipe
    ]
})
export class GoalRoadmapComponent implements OnInit {

  milestones$?: Observable<Milestone[]>
  stakeholder = createGoalStakeholder({ isAdmin: true, isAchiever: true })

  @Input() goal?: Goal

  constructor(
    private elRef: ElementRef,
    private milestoneService: MilestoneService,
    private scrollService: ScrollService
  ) { }

  ngOnInit() {
    if (!this.goal) return
    const query = [where('deletedAt', '==', null), orderBy('order', 'asc')]
    this.milestones$ = this.milestoneService.valueChanges(query, { goalId: this.goal.id }).pipe(
      tap(async () => {
        const scrollHeight = this.scrollService.scrollHeight
        if (!scrollHeight) return

        const ionContent = this.elRef.nativeElement.closest('ion-content') as IonContent
        if (!ionContent) return

        ionContent.getScrollElement().then(scrollElement => {
          ionContent.scrollToPoint(0, scrollElement.scrollTop + scrollHeight - 6)
          this.scrollService.scrollHeight = undefined
        })
      })
    )
  }

}
