import { ChangeDetectionStrategy, Component, HostBinding, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { ModalController } from '@ionic/angular';
import { UserSpectateService } from '../../+state/spectator.service';
import { UserService } from '@strive/user/user/+state/user.service';
import { map, switchMap } from 'rxjs';

@Component({
  selector: 'user-following',
  templateUrl: 'following.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FollowingComponent implements OnInit {
  spectating$ = this.user.user$.pipe(
    map(user => {
      const uid = this.router.url.split('/').pop();
      return uid === 'profile' ? user.uid : uid
    }),
    switchMap(uid => this.service.getSpectating(uid))
  )
  
  @HostListener('window:popstate', ['$event'])
  onPopState() {
    this.modalCtrl.dismiss()
  }
  @HostBinding() modal: HTMLIonModalElement

  constructor(
    private location: Location,
    private modalCtrl: ModalController,
    private service: UserSpectateService,
    private router: Router,
    private user: UserService
  ) {
    window.history.pushState(null, null, window.location.href)
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