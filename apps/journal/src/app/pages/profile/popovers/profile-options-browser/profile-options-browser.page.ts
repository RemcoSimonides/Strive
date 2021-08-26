import { Component } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
// Services
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '@strive/user/user/+state/user.service';
// Components
import { AuthModalPage, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page';
import { FcmService } from '@strive/utils/services/fcm.service';

@Component({
  selector: 'app-profile-options-browser',
  templateUrl: './profile-options-browser.page.html',
  styleUrls: ['./profile-options-browser.page.scss'],
})
export class ProfileOptionsBrowserPage {

  constructor(
    private afAuth: AngularFireAuth,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router,
    private user: UserService,
    private fcm: FcmService
  ) { }

  goToProfile() {
    this.router.navigateByUrl(`/profile/${this.user.uid}`)
    this.popoverCtrl.dismiss()
  }

  pushNotifications() {
    this.fcm.registerFCM()
    this.popoverCtrl.dismiss()
  }

  async signOut() {
    await this.afAuth.signOut()
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