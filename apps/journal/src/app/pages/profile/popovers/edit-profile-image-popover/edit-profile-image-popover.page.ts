import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavParams, PopoverController } from '@ionic/angular';
// Strive
import { UserService } from '@strive/user/user/+state/user.service';

@Component({
  selector: 'journal-edit-profile-image-popover',
  templateUrl: './edit-profile-image-popover.page.html',
  styleUrls: ['./edit-profile-image-popover.page.scss'],
})
export class EditProfileImagePopoverComponent implements OnInit {

  form: FormControl;

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController,
    public user: UserService
  ) { }

  ngOnInit() {
    this.form = new FormControl(this.navParams.data.storagePath)
  }

  public update() {
    if (!this.form.value) {
      throw new Error('Nothing to update')
    }

    this.user.update({ uid: this.user.uid, photoURL: this.form.value })
    this.popoverCtrl.dismiss(this.form.value)
  }

}
