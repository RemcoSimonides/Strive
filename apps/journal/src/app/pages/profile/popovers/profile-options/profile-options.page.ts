import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-profile-options',
  templateUrl: './profile-options.page.html',
  styleUrls: ['./profile-options.page.scss'],
})
export class ProfileOptionsPage implements OnInit {

  public enumProfileOptions = enumProfileOptions

  constructor(
    private popoverCtrl: PopoverController
  ) { }

  ngOnInit() {}

  async close(profileOption: enumProfileOptions) {
    this.popoverCtrl.dismiss(profileOption)
  }

}

export enum enumProfileOptions {
  editProfile,
  pushNotificationPermission,
  logOut
}