import { ChangeDetectionStrategy, Component, Input, OnInit, inject } from '@angular/core'
import { orderBy } from 'firebase/firestore'
import { joinWith } from '@strive/utils/firebase'
import { Observable, of } from 'rxjs'
import { createGoalStakeholder, Goal, Milestone } from '@strive/model'
import { MilestoneService } from '@strive/roadmap/milestone.service'
import { GoalService } from '@strive/goal/goal.service'
import { ProfileService } from '@strive/user/profile.service'

@Component({
    selector: '[id] strive-roadmap',
    templateUrl: './roadmap.component.html',
    styleUrls: ['./roadmap.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class AdminRoadmapComponent implements OnInit {
  private goal = inject(GoalService);
  private milestone = inject(MilestoneService);
  private profileService = inject(ProfileService);


  milestones$?: Observable<Milestone[]>
  goal$?: Observable<Goal | undefined>
  stakeholder = createGoalStakeholder({ isAdmin: true, isAchiever: true })

	@Input() id!: string


	ngOnInit() {
    this.goal$ = this.goal.valueChanges(this.id)
    this.milestones$ = this.milestone.collectionData([orderBy('order', 'asc')], { goalId: this.id }).pipe(
      joinWith({
        achiever: ({ achieverId }) => achieverId ? this.profileService.docData(achieverId) : of(undefined)
      })
    )
	}

  doReorder(ev: any, milestones: Milestone[]) {
    const { from, to } = ev.detail

    const element = milestones[from]
    milestones.splice(from, 1)
    milestones.splice(to, 0, element)

    milestones.forEach(((milestone, index) => { milestone.order = index }))

    const min = Math.min(from, to)
    const max = Math.max(from, to)
    const milestonesToUpdate = milestones.filter(milestone => milestone.order >= min && milestone.order <= max).map(milestone => ({ id: milestone.id, order: milestone.order }))

    this.milestone.update(milestonesToUpdate, { params: { goalId: this.id }})
    ev.detail.complete()
  }
}
