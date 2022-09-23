import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Location } from '@angular/common'
import { Router } from '@angular/router'
import { ModalController } from '@ionic/angular'

import { map, of, switchMap } from 'rxjs'
import { ModalDirective } from '@strive/utils/directives/modal.directive'

import { UserSpectateService } from '../../spectator.service'
import { AuthService } from '../../../auth/auth.service'

@Component({
  selector: 'user-followers',
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
    switchMap(uid => uid ? this.service.getSpectators(uid) : of([]))
  )

  constructor(
    private auth: AuthService,
    protected override location: Location,
    protected override modalCtrl: ModalController,
    private service: UserSpectateService,
    private router: Router
  ) {
    super(location, modalCtrl)
  }

  navigateTo(uid: string) {
    this.router.navigateByUrl(`profile/${uid}`)
    this.modalCtrl.dismiss()
  }
}