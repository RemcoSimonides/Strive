import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { ModalController, Platform } from '@ionic/angular'

import { joinWith } from 'ngfire'
import { map, switchMap, of } from 'rxjs'

import { SpectatorService } from '../../spectator.service'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'

@Component({
  selector: 'strive-user-following',
  templateUrl: 'following.component.html',
  styleUrls: ['./following.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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
    protected override platform: Platform,
    private profileService: ProfileService,
    private service: SpectatorService,
    private router: Router
  ) {
    super(location, modalCtrl, platform)
  }

  navigateTo(uid: string) {
    this.router.navigateByUrl(`profile/${uid}`)
    this.modalCtrl.dismiss()
  }
}