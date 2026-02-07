import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform, signal, inject } from '@angular/core'

import { IonContent, IonButton, IonList, IonItem, IonThumbnail, IonLabel } from '@ionic/angular/standalone'

import { AuthService } from '@strive/auth/auth.service'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { Goal, GoalStakeholder, createGoalStakeholder } from '@strive/model'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { map, of, switchMap } from 'rxjs'

@Pipe({
  standalone: true,
  name: 'getStakeholder'
})
class GetStakeholderPipe implements PipeTransform {
  private auth = inject(AuthService);
  private stakeholder = inject(GoalStakeholderService);


  transform(goal: Goal) {
    return this.auth.uid$.pipe(
      switchMap(uid => uid ? this.stakeholder.docData(uid, { goalId: goal.id }) : of(undefined)),
      map(stakeholder => createGoalStakeholder(stakeholder))
    )
  }
}

@Component({
    selector: 'journal-follow-goals-modal',
    templateUrl: './follow-goals.component.html',
    styleUrls: ['./follow-goals.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        HeaderModalComponent,
        GetStakeholderPipe,
        ImageDirective,
        IonContent,
        IonButton,
        IonList,
        IonItem,
        IonThumbnail,
        IonLabel
    ]
})
export class FollowGoalsModalComponent extends ModalDirective {
  private auth = inject(AuthService);
  private stakeholderService = inject(GoalStakeholderService);

  allSpectated = signal(false)

  @Input() goals: Goal[] = []
  @Input() username = ''

  constructor() {
    super()
  }

  spectate(goalId: string, stakeholder: GoalStakeholder) {
    const uid = this.auth.uid()
    if (!uid) return

    const { isSpectator } = stakeholder
    return this.stakeholderService.upsert({
      uid,
      goalId,
      isSpectator: !isSpectator
    }, { goalId })
  }

  spectateAll() {
    const uid = this.auth.uid()
    if (!uid) return

    this.allSpectated.set(true)
    return this.goals.map(goal => {
      const stakeholder = createGoalStakeholder({
        uid,
        goalId: goal.id,
        isSpectator: true
      })

      return this.stakeholderService.upsert(stakeholder, { goalId: goal.id })
    })
  }
}
