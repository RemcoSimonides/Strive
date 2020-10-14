import { Component, OnInit } from '@angular/core';
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
export class ProfileOptionsBrowserPage implements OnInit {

  enumProfileOptionsDesktop = enumProfileOptionsDesktop

  constructor(
    private afAuth: AngularFireAuth,
    private _modalCtrl: ModalController,
    private _popoverCtrl: PopoverController,
    private router: Router,
    private user: UserService
  ) { }

  ngOnInit() {
  }

  async close(profileOption: enumProfileOptionsDesktop) {
    this._popoverCtrl.dismiss(profileOption)
  }

  async goToProfile() {
    this.router.navigateByUrl(`/profile/${this.user.uid}`)
    this._popoverCtrl.dismiss()
  }

  async logOut() {
    await this.afAuth.signOut()
    this._popoverCtrl.dismiss()

    // open auth modal
    const modal = await this._modalCtrl.create({
      component: AuthModalPage,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    })
    await modal.present()

  }

}

export enum enumProfileOptionsDesktop {
  editProfile,
  pushNotificationPermission,
  logOut
}