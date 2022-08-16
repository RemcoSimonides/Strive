import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NavParams, PopoverController } from '@ionic/angular';
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component';
// Strive
import { UserService } from '@strive/user/user/user.service';

@Component({
  selector: 'journal-edit-profile-image-popover',
  templateUrl: './edit-profile-image.component.html',
  styleUrls: ['./edit-profile-image.component.scss']
})
export class EditProfileImagePopoverComponent implements OnInit {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  form?: FormControl

  constructor(
    private navParams: NavParams,
    private popoverCtrl: PopoverController,
    public user: UserService
  ) { }

  ngOnInit() {
    this.form = new FormControl(this.navParams.data['storagePath'])
  }

  update() {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    if (!this.form?.value) {
      throw new Error('Nothing to update')
    }

    this.user.update({ uid: this.user.uid, photoURL: this.form.value })
    this.popoverCtrl.dismiss(this.form.value)
  }
}