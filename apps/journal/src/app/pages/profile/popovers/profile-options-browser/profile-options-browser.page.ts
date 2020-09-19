import { Component, OnInit } from '@angular/core';
import { PopoverController, ModalController } from '@ionic/angular';
import { Router } from '@angular/router';
// Services
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
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
    public _authService: AuthService,
    private _modalCtrl: ModalController,
    private _popoverCtrl: PopoverController,
    private router: Router,
  ) { }

  ngOnInit() {
  }

  async close(profileOption: enumProfileOptionsDesktop) {
    this._popoverCtrl.dismiss(profileOption)
  }

  async goToProfile() {
    const { uid } = await this._authService.afAuth.currentUser
    this.router.navigateByUrl(`/profile/${uid}`)
    this._popoverCtrl.dismiss()
  }

  async logOut() {
    await this._authService.signOut()
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