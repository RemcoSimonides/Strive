import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular'

import { Spectator } from '../../+state/spectator.firestore';
import { UserSpectateService } from '../../+state/spectator.service';

@Component({
  selector: 'user-followers',
  templateUrl: 'followers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FollowersComponent {
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    // would be nice to prevent the navigation too
    this.modalCtrl.dismiss()
  }

  spectators: Spectator[] = [];

  constructor(
    public modalCtrl: ModalController,
    private service: UserSpectateService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    const uid = this.router.url.split('/').pop();
    if (uid) {
      this.service.getSpectators(uid).then(spectators => {
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