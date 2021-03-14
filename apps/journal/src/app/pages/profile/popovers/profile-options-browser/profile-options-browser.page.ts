import { Component } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
// Services
import { AngularFireAuth } from '@angular/fire/auth';
import { UserService } from '@strive/user/user/+state/user.service';
// Components
import { enumAuthSegment, AuthModalPage } from 'apps/journal/src/app/pages/auth/auth-modal.page';

@Component({
  selector: 'app-profile-options-browser',
  templateUrl: './profile-options-browser.page.html',
  styleUrls: ['./profile-options-browser.page.scss'],
})
export class ProfileOptionsBrowserPage {

  enumProfileOptionsDesktop = enumProfileOptionsDesktop

  constructor(
    private afAuth: AngularFireAuth,
    private modalCtrl: ModalController,
    private popoverCtrl: PopoverController,
    private router: Router,
    private user: UserService
  ) { }

  close(profileOption: enumProfileOptionsDesktop) {
    this.popoverCtrl.dismiss(profileOption)
  }

  goToProfile() {
    this.router.navigateByUrl(`/profile/${this.user.uid}`)
    this.popoverCtrl.dismiss()
  }

  async logOut() {
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

export enum enumProfileOptionsDesktop {
  editProfile,
  pushNotificationPermission,
  logOut
}