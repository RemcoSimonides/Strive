import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { limit, where } from '@angular/fire/firestore';
import { PopoverController, ModalController } from '@ionic/angular';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
// Services
import { UserService } from '@strive/user/user/+state/user.service';
// Components
import { AuthModalPage, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { FcmService } from '@strive/utils/services/fcm.service';
import { NotificationService } from '@strive/notification/+state/notification.service';

@Component({
  selector: 'app-profile-options-browser',
  templateUrl: './profile-options-browser.page.html',
  styleUrls: ['./profile-options-browser.page.scss'],
})
export class ProfileOptionsBrowserPage {

  unreadNotifications$: Observable<boolean>

  constructor(
    private auth: Auth,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router,
    private user: UserService,
    private fcm: FcmService,
    private notification: NotificationService
  ) {
    this.unreadNotifications$ = this.user.profile$.pipe(
      switchMap(profile => profile
        ? this.notification.valueChanges([where('type', '==', 'notification'), where('isRead', '==', false), limit(1)], { uid: profile.uid }).pipe(map(notifications => !!notifications.length))
        : of(false)
      )
    )
  }

  goToProfile() {
    this.router.navigateByUrl(`/profile/${this.user.uid}`)
    this.popoverCtrl.dismiss()
  }

  goToNotifications() {
    this.router.navigateByUrl(`/notifications`)
    this.popoverCtrl.dismiss()
  }

  pushNotifications() {
    this.fcm.registerFCM()
    this.popoverCtrl.dismiss()
  }

  async signOut() {
    await this.auth.signOut()
    this.popoverCtrl.dismiss()

    // open auth modal
    this.modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }
}