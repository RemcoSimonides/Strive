import { Component } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { PopoverController } from '@ionic/angular';
import { FcmService } from '@strive/utils/services/fcm.service';

@Component({
  selector: 'app-profile-options',
  templateUrl: './profile-options.page.html',
  styleUrls: ['./profile-options.page.scss'],
})
export class ProfileOptionsPage {

  constructor(
    private auth: Auth,
    private popoverCtrl: PopoverController,
    private fcm: FcmService
  ) { }

  pushNotifications() {
    this.fcm.registerFCM();
    this.popoverCtrl.dismiss()
  }

  signOut() {
    this.auth.signOut()
    this.popoverCtrl.dismiss()
  }
}