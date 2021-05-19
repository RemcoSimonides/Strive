import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular'
import { UserService } from '@strive/user/user/+state/user.service';

import { Spectator } from '../../+state/spectator.firestore';
import { UserSpectateService } from '../../+state/spectator.service';

@Component({
  selector: 'user-followers',
  templateUrl: 'followers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FollowersComponent {

  spectators: Spectator[] = [];

  constructor(
    public modalCtrl: ModalController,
    private service: UserSpectateService,
    private user: UserService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    if (!!this.user.uid) {
      this.service.getSpectators(this.user.uid).then(spectators => {
        this.spectators = spectators
        this.cdr.markForCheck()
      })
    }
  }

  navigateTo(uid: string) {
    this.router.navigateByUrl(`profile/${uid}`)
    this.modalCtrl.dismiss()
  }
}