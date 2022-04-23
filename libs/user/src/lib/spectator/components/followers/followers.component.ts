import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular'

import { Spectator } from '../../+state/spectator.firestore';
import { UserSpectateService } from '../../+state/spectator.service';

@Component({
  selector: 'user-followers',
  templateUrl: 'followers.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class FollowersComponent implements OnInit {
  spectators: Spectator[] = []

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
      this.service.getSpectators(uid).then(spectators => {
        this.spectators = spectators
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