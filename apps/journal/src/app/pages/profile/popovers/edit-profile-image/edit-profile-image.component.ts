import { CommonModule } from '@angular/common'
import { Component, OnInit, ViewChild, HostListener } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'

import { IonButton, NavParams, PopoverController } from '@ionic/angular/standalone'

import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { AuthService } from '@strive/auth/auth.service'
import { ProfileService } from '@strive/user/profile.service'

@Component({
  standalone: true,
  selector: 'journal-edit-profile-image-popover',
  templateUrl: './edit-profile-image.component.html',
  styleUrls: ['./edit-profile-image.component.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageSelectorComponent,
    IonButton
  ]
})
export class EditProfileImagePopoverComponent implements OnInit {
  @HostListener('window:popstate', ['$event'])
  onPopState() { this.popoverCtrl.dismiss() }

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
