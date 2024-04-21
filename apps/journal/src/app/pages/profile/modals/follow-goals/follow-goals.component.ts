import { CommonModule, Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, Pipe, PipeTransform, signal } from '@angular/core'

import { IonContent, IonButton, IonList, IonItem, IonThumbnail, IonLabel, ModalController } from '@ionic/angular/standalone'

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

  constructor(
    private auth: AuthService,
    private stakeholder: GoalStakeholderService
  ) { }

  transform(goal: Goal) {
    return this.auth.uid$.pipe(
      switchMap(uid => uid ? this.stakeholder.valueChanges(uid, { goalId: goal.id }) : of(undefined)),
      map(stakeholder => createGoalStakeholder(stakeholder))
    )
  }
}

@Component({
  standalone: true,
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
  allSpectated = signal(false)

  @Input() goals: Goal[] = []
  @Input() username = ''

  constructor(
    private auth: AuthService,
    location: Location,
    modalCtrl: ModalController,
    private stakeholderService: GoalStakeholderService
  ) {
    super(location, modalCtrl)
  }

  spectate(goalId: string, stakeholder: GoalStakeholder) {
    if (!this.auth.uid) return

    const { isSpectator } = stakeholder
    return this.stakeholderService.upsert({
      uid: this.auth.uid,
      goalId,
      isSpectator: !isSpectator
    }, { params: { goalId } })
  }

  spectateAll() {
    if (!this.auth.uid) return

    this.allSpectated.set(true)
    return this.goals.map(goal => {
      const stakeholder = createGoalStakeholder({
        uid: this.auth.uid,
        goalId: goal.id,
        isSpectator: true
      })

      return this.stakeholderService.upsert(stakeholder, { params: { goalId: goal.id } })
    })
  }
}
