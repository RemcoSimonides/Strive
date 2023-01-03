import { Component, OnInit, ViewChild } from '@angular/core'
import { FormControl } from '@angular/forms'
import { NavParams, PopoverController } from '@ionic/angular'

import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/user/profile.service'

@Component({
  selector: 'journal-edit-profile-image-popover',
  templateUrl: './edit-profile-image.component.html',
  styleUrls: ['./edit-profile-image.component.scss']
})
export class EditProfileImagePopoverComponent implements OnInit {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  form?: FormControl

  uid = this.auth.uid

  constructor(
    private auth: AuthService,
    private navParams: NavParams,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService
  ) { }

  ngOnInit() {
    this.form = new FormControl(this.navParams.data['storagePath'])
  }

  update() {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    if (!this.form?.value) return

    this.profileService.update({ uid: this.auth.uid, photoURL: this.form.value })
    this.popoverCtrl.dismiss(this.form.value)
  }
}