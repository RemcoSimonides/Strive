import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core'
import { IonicModule, ItemReorderEventDetail } from '@ionic/angular'
import { map, of, switchMap } from 'rxjs'
import { AuthService } from '@strive/auth/auth.service'
import { GoalService } from '@strive/goal/goal.service'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { StakeholderWithGoal } from '@strive/model'
import { ImageModule } from '@strive/media/directives/image.module'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'

@Component({
  standalone: true,
  selector: 'strive-assess-life-prioritize-goals',
  templateUrl: './prioritize-goals.component.html',
  styleUrls: ['./prioritize-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    IonicModule,
    PageLoadingModule,
    ImageModule
  ]
})
export class PrioritizeGoalsComponent {

  goals$ = this.auth.profile$.pipe(
    switchMap(profile => profile ? this.goalService.getStakeholderGoals(profile.uid, 'isAchiever', false) : of([])),
    map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goal.status === 'pending')),
    map(stakeholders => stakeholders.sort((first, second) => {
      if (first.priority === second.priority) {
        if (!first.createdAt || !second.createdAt) return 0
        return first.createdAt > second.createdAt ? -1 : 1
      } else {
        return first.priority > second.priority ? 1 : -1
      }
    }))
  )

  @Output() step = new EventEmitter<'next' | 'previous'>()

  constructor(
    private auth: AuthService,
    private goalService: GoalService,
    private stakeholderService: GoalStakeholderService
  ) {}

  doReorder(ev: CustomEvent<ItemReorderEventDetail>, stakeholders: StakeholderWithGoal[]) {
    if (!this.auth.uid) return

    const { from, to } = ev.detail
    const element = stakeholders[from]
    stakeholders.splice(from, 1)
    stakeholders.splice(to, 0, element)

    if (stakeholders.some(stakeholder => stakeholder.priority === -1)) {
      // update all stakeholders
      stakeholders.forEach((stakeholder, priority) => {
        this.stakeholderService.update({ uid: this.auth.uid, priority }, { params: { goalId: stakeholder.goalId }})
      })

    } else {
      // only update the stakeholders that have been changed
      const min = Math.min(from, to)
      const max = Math.max(from, to)
      const stakeholdersToUpdate = stakeholders.slice(min, max + 1)

      stakeholdersToUpdate.forEach((stakeholder, index) => {
        const priority = index + min
        this.stakeholderService.update({ uid: this.auth.uid, priority }, { params: { goalId: stakeholder.goalId }})
      })
    }
    ev.detail.complete()
  }
}