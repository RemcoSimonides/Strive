import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular';

import { Spectator } from '../../+state/spectator.firestore';
import { UserSpectateService } from '../../+state/spectator.service';

@Component({
  selector: 'user-following',
  templateUrl: 'following.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FollowingComponent {

  spectating: Spectator[] = [];

  constructor(
    public modalCtrl: ModalController,
    private service: UserSpectateService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    const uid = this.router.url.split('/').pop();
    if (uid) {
      this.service.getSpectating(uid).then(spectating => {
        this.spectating = spectating
        this.cdr.markForCheck()
      })
    }
  }

  navigateTo(uid: string) {
    this.router.navigateByUrl(`profile/${uid}`)
    this.modalCtrl.dismiss()
  }
}