import { ChangeDetectionStrategy, Component } from '@angular/core'
import { Router } from '@angular/router'
import { Location } from '@angular/common'
import { ModalController } from '@ionic/angular'

import { map, switchMap, of } from 'rxjs'

import { UserSpectateService } from '../../spectator.service'
import { ModalDirective } from '@strive/utils/directives/modal.directive'
import { AuthService } from '../../../auth/auth.service'

@Component({
  selector: 'user-following',
  templateUrl: 'following.component.html',
  styleUrls: ['./following.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowingComponent extends ModalDirective {
  spectating$ = this.auth.user$.pipe(
    map(user => {
      const uid = this.router.url.split('/').pop();
      return uid === 'profile' ? user?.uid : uid
    }),
    switchMap(uid => uid ? this.service.getSpectating(uid) : of([]))
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