import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import { FcmService } from '@strive/utils/services/fcm.service';

@Component({
  selector: 'app-profile-options',
  templateUrl: './profile-options.page.html',
  styleUrls: ['./profile-options.page.scss'],
})
export class ProfileOptionsPage implements OnInit {

  public enumProfileOptions = enumProfileOptions

  constructor(
    private popoverCtrl: PopoverController,
    private fcm: FcmService
  ) { }

  ngOnInit() {}

  async close(profileOption: enumProfileOptions) {
    this.popoverCtrl.dismiss(profileOption)
  }

  pushNotifications() {
    this.fcm.registerFCM();
    this.popoverCtrl.dismiss()
  }
}

export enum enumProfileOptions {
  editProfile,
  pushNotificationPermission,
  logOut
}