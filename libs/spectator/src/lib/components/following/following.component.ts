import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Router } from '@angular/router'
import { CommonModule, Location } from '@angular/common';
import { IonTitle, IonContent, IonList, IonItem, IonAvatar, IonLabel, ModalController } from '@ionic/angular/standalone'

import { joinWith } from 'ngfire'
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
  spectating$ = this.auth.user$.pipe(
    map(user => {
      const uid = this.router.url.split('/').pop()
      return uid === 'profile' ? user?.uid : uid
    }),
    switchMap(uid => uid ? this.service.getSpectating(uid) : of([])),
    joinWith({
      profile: spectator => this.profileService.valueChanges(spectator.profileId)
    }, { shouldAwait: true })
  )

  constructor(
    private auth: AuthService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private profileService: ProfileService,
    private service: SpectatorService,
    private router: Router
  ) {
    super(location, modalCtrl)
  }

  navTo(uid: string) {
    const path = ['/profile', uid]
    this.navigateTo(this.router, path)
  }
}
