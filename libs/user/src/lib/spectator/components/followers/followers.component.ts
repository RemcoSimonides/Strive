import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular'
import { UserSpectateService } from '../../spectator.service';
import { UserService } from '@strive/user/user/user.service';
import { map, switchMap } from 'rxjs';
import { ModalDirective } from '@strive/utils/directives/modal.directive';

@Component({
  selector: 'user-followers',
  templateUrl: 'followers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowersComponent extends ModalDirective {

  spectators$ = this.user.user$.pipe(
    map(user => {
      const uid = this.router.url.split('/').pop()
      return uid === 'profile' ? user.uid : uid
    }),
    switchMap(uid => this.service.getSpectators(uid))
  )

  constructor(
    protected location: Location,
    protected modalCtrl: ModalController,
    private service: UserSpectateService,
    private router: Router,
    private user: UserService
  ) {
    super(location, modalCtrl)
  }

  navigateTo(uid: string) {
    this.router.navigateByUrl(`profile/${uid}`)
    this.modalCtrl.dismiss()
  }
}