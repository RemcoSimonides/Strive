import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { PopoverController } from '@ionic/angular';
// Strive
import { UserService } from '@strive/user/user/+state/user.service';

@Component({
  selector: 'app-edit-profile-image-popover',
  templateUrl: './edit-profile-image-popover.page.html',
  styleUrls: ['./edit-profile-image-popover.page.scss'],
})
export class EditProfileImagePopoverPage {

  form = new FormControl();

  constructor(
    private popoverCtrl: PopoverController,
    public user: UserService
  ) { }

  public update() {
    if (!this.form.value) {
      throw new Error('Nothing to update')
    }

    // update profile
    this.user.upsertProfile({ photoURL: this.form.value })
    this.popoverCtrl.dismiss(this.form.value)
  }

}
