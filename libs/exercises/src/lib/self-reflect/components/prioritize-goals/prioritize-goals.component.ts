import { CommonModule } from '@angular/common'
import { FormArray, FormControl } from '@angular/forms'
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, signal } from '@angular/core'
import { IonList, IonReorderGroup, IonItem, IonThumbnail, IonLabel, IonReorder, IonButton, ItemReorderEventDetail } from '@ionic/angular/standalone'
import { BehaviorSubject, combineLatest, map, of, switchMap, tap } from 'rxjs'
import { AuthService } from '@strive/auth/auth.service'
import { GoalService } from '@strive/goal/goal.service'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { SelfReflectEntry, StakeholderWithGoal } from '@strive/model'
import { ImageModule } from '@strive/media/directives/image.module'

@Component({
  standalone: true,
  selector: 'strive-self-reflect-prioritize-goals',
  templateUrl: './prioritize-goals.component.html',
  styleUrls: ['./prioritize-goals.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    PageLoadingModule,
    ImageModule,
    IonList,
    IonReorderGroup,
    IonItem,
    IonThumbnail,
    IonLabel,
    IonReorder,
    IonButton
  ]
})
export class PrioritizeGoalsComponent {

  goals$ = this.auth.profile$.pipe(
    switchMap(profile => profile
      ? combineLatest([
        this.goalService.getStakeholderGoals(profile.uid, 'isAchiever', false).pipe(
          map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goal.status === 'pending')),
        ),
        this._answers$
      ])
      : of([], [])),
    map(([stakeholders, answers]) => stakeholders.sort((first, second) => {
      if (answers && answers.length) {
        const firstIndex = answers.findIndex(id => id === first.goalId)
        const secondIndex = answers.findIndex(id => id === second.goalId)

        if (firstIndex !== -1 && secondIndex !== -1) {
          return firstIndex > secondIndex ? 1 : -1
        } else if (firstIndex !== -1) {
          return -1
        } else if (secondIndex !== -1) {
          return 1
        }
      }

      if (first.priority === second.priority) {
        if (!first.createdAt || !second.createdAt) return 0
        return first.createdAt > second.createdAt ? -1 : 1
      } else {
        return first.priority > second.priority ? 1 : -1
      }
    })),
    tap(value => {
      if (this._form) {
        this._form.clear()
        value.forEach(stakeholder => this._form?.push(new FormControl(stakeholder.goalId, { nonNullable: true })))
      }
    })
  )

  disableReorder = signal<boolean>(false)
  private _form?: FormArray<FormControl<string>>
  private _answers$ = new BehaviorSubject<string[]>([])

  @Input() set form(form: FormArray<FormControl<string>>) {
    if (!form) return
    this._form = form
    this._answers$.next(form.value)
  }
  @Input() set entry(entry: SelfReflectEntry) {
    this.disableReorder.set(true)
    if (!entry?.prioritizeGoals) return
    this._answers$.next(entry.prioritizeGoals)
  }
  @Output() step = new EventEmitter<'next' | 'previous'>()

  constructor(
    private auth: AuthService,
    private goalService: GoalService
  ) { }

  doReorder(ev: CustomEvent<ItemReorderEventDetail>, stakeholders: StakeholderWithGoal[]) {
    if (!this.auth.uid || !this._form) return

    const { from, to } = ev.detail
    const element = stakeholders[from]
    stakeholders.splice(from, 1)
    stakeholders.splice(to, 0, element)

    const ids = stakeholders.map(stakeholder => stakeholder.goalId)

    this._form.clear()
    ids.forEach(id => this._form?.push(new FormControl(id, { nonNullable: true })))
    this._form?.markAsDirty()

    ev.detail.complete()
  }
}
