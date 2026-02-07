import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { Router } from '@angular/router'
import { CommonModule } from '@angular/common';
import { IonTitle, IonContent, IonList, IonItem, IonAvatar, IonLabel } from '@ionic/angular/standalone'

import { joinWith } from '@strive/utils/firebase'
import { map, switchMap, of } from 'rxjs'

import { SpectatorService } from '../../spectator.service'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
    selector: 'strive-user-following',
    templateUrl: 'following.component.html',
    styleUrls: ['./following.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        ImageDirective,
        HeaderModalComponent,
        IonTitle,
        IonContent,
        IonList,
        IonItem,
        IonAvatar,
        IonLabel
    ]
})
export class FollowingComponent extends ModalDirective {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private service = inject(SpectatorService);
  private router = inject(Router);

  spectating$ = this.auth.user$.pipe(
    map(user => {
      const uid = this.router.url.split('/').pop()
      return uid === 'profile' ? user?.uid : uid
    }),
    switchMap(uid => uid ? this.service.getSpectating(uid) : of([])),
    joinWith({
      profile: spectator => this.profileService.docData(spectator.profileId)
    }, { shouldAwait: true })
  )

  constructor() {
    super()
  }

  navTo(uid: string) {
    const path = ['/profile', uid]
    this.navigateTo(this.router, path)
  }
}
