import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'
import { IonTitle, IonContent, IonList, IonItem, IonAvatar, IonLabel } from '@ionic/angular/standalone'

import { joinWith } from '@strive/utils/firebase'

import { map, of, switchMap } from 'rxjs'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { SpectatorService } from '../../spectator.service'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'
import { ImageDirective } from '@strive/media/directives/image.directive'
import { HeaderModalComponent } from '@strive/ui/header-modal/header-modal.component'

@Component({
    selector: 'strive-user-followers',
    templateUrl: 'followers.component.html',
    styleUrls: ['./followers.component.scss'],
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
export class FollowersComponent extends ModalDirective {
  private auth = inject(AuthService);
  private profileService = inject(ProfileService);
  private service = inject(SpectatorService);
  private router = inject(Router);


  spectators$ = this.auth.user$.pipe(
    map(user => {
      const uid = this.router.url.split('/').pop()
      return uid === 'profile' ? user?.uid : uid
    }),
    switchMap(uid => uid ? this.service.getSpectators(uid) : of([])),
    joinWith({
      profile: spectator => this.profileService.docData(spectator.uid)
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
