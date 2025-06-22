import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { CommonModule, Location } from '@angular/common';
import { Router } from '@angular/router'
import { IonTitle, IonContent, IonList, IonItem, IonAvatar, IonLabel, ModalController } from '@ionic/angular/standalone'

import { joinWith } from 'ngfire'

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
  protected override location: Location;
  protected override modalCtrl: ModalController;
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
      profile: spectator => this.profileService.valueChanges(spectator.uid)
    }, { shouldAwait: true })
  )

  constructor() {
    const location = inject(Location);
    const modalCtrl = inject(ModalController);

    super(location, modalCtrl)

    this.location = location;
    this.modalCtrl = modalCtrl;
  }

  navTo(uid: string) {
    const path = ['/profile', uid]
    this.navigateTo(this.router, path)
  }
}
