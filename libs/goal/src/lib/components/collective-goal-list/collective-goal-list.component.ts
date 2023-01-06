import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { AuthService } from '@strive/auth/auth.service'

import { ImageModule } from '@strive/media/directives/image.module'
import { Goal, GoalStakeholder, User } from '@strive/model'
import { GoalStakeholderService } from '@strive/stakeholder/stakeholder.service'
import { ProfileService } from '@strive/user/profile.service'
import { where } from 'firebase/firestore'
import { joinWith } from 'ngfire'
import { map, Observable } from 'rxjs'
import { MiniThumbnailSwiperModule } from '../mini-thumbnail-swiper/mini-thumbnail-swiper.module'

interface Stakeholder extends GoalStakeholder {
  profile?: User,
}

@Component({
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    ImageModule,
    MiniThumbnailSwiperModule
  ],
  selector: 'strive-collective-stakeholders-list',
  templateUrl: './collective-goal-list.component.html',
  styleUrls: ['./collective-goal-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectiveGoalListSComponent {

  @Input() set goal(goal: Goal) {
    if (!goal?.collectiveGoalId) {
      this.achievers$ = undefined
    }

    const query = [
      where('collectiveGoalId', '==', goal.collectiveGoalId),
      where('isAchiever', '==', true)
    ]
    this.achievers$ = this.stakeholderService.valueChanges(query).pipe(
      joinWith({
        profile: stakeholder => this.profileService.valueChanges(stakeholder.uid)
      }, { shouldAwait: true }),
      map(stakeholders => stakeholders.filter(stakeholder => stakeholder.goalId !== goal.id))
    )
  }

  achievers$?: Observable<Stakeholder[]>
  uid = this.auth.uid
  
  constructor(
    private auth: AuthService,
    private stakeholderService: GoalStakeholderService,
    private profileService: ProfileService
  ) {}
}