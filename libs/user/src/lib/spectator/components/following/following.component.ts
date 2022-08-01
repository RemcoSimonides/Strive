import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { UserSpectateService } from '../../spectator.service';
import { UserService } from '@strive/user/user/user.service';
import { map, switchMap } from 'rxjs';
import { ModalDirective } from '@strive/utils/directives/modal.directive';

@Component({
  selector: 'user-following',
  templateUrl: 'following.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowingComponent extends ModalDirective {
  spectating$ = this.user.user$.pipe(
    map(user => {
      const uid = this.router.url.split('/').pop();
      return uid === 'profile' ? user.uid : uid
    }),
    switchMap(uid => this.service.getSpectating(uid))
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