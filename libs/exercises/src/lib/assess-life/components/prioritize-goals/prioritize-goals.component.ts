import { CommonModule } from '@angular/common'
import { FormArray, FormControl } from '@angular/forms'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core'
import { IonicModule, ItemReorderEventDetail } from '@ionic/angular'
import { map, of, switchMap } from 'rxjs'
import { AuthService } from '@strive/auth/auth.service'
import { GoalService } from '@strive/goal/goal.service'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { StakeholderWithGoal } from '@strive/model'
import { ImageModule } from '@strive/media/directives/image.module'

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

  @Input() form?: FormArray<FormControl<string>>
  @Output() step = new EventEmitter<'next' | 'previous'>()

  constructor(
    private auth: AuthService,
    private goalService: GoalService
  ) {}

  doReorder(ev: CustomEvent<ItemReorderEventDetail>, stakeholders: StakeholderWithGoal[]) {
    if (!this.auth.uid || !this.form) return

    const { from, to } = ev.detail
    const element = stakeholders[from]
    stakeholders.splice(from, 1)
    stakeholders.splice(to, 0, element)

    const ids = stakeholders.map(stakeholder => stakeholder.goalId)

    this.form.clear()
    ids.forEach(id => this.form?.push(new FormControl(id, { nonNullable: true })))
    this.form?.markAsDirty()

    ev.detail.complete()
  }
}