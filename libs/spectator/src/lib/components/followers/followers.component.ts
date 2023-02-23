import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Location } from '@angular/common'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular'

import { joinWith } from 'ngfire'

import { map, of, switchMap } from 'rxjs'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { SpectatorService } from '../../spectator.service'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'

@Component({
  selector: 'strive-user-followers',
  templateUrl: 'followers.component.html',
  styleUrls: ['./followers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowersComponent extends ModalDirective {

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