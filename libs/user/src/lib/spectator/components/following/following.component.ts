import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';

import { Spectator } from '../../+state/spectator.firestore';
import { UserSpectateService } from '../../+state/spectator.service';

@Component({
  selector: 'user-following',
  templateUrl: 'following.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowingComponent implements OnInit {
  spectating: Spectator[] = []
  
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }
  @HostBinding() modal: HTMLIonModalElement

  constructor(
    private location: Location,
    private modalCtrl: ModalController,
    private service: UserSpectateService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {
    window.history.pushState(null, null, window.location.href)

    const uid = this.router.url.split('/').pop();
    if (uid) {
      this.service.getSpectating(uid).then(spectating => {
        this.spectating = spectating
        this.cdr.markForCheck()
      })
    }
  }

  ngOnInit() {
    this.modal.onWillDismiss().then(res => {
      if (res.role === 'backdrop') this.location.back()
    })
  }

  dismiss() {
    this.location.back()
  }

  navigateTo(uid: string) {
    this.router.navigateByUrl(`profile/${uid}`)
    this.modalCtrl.dismiss()
  }
}