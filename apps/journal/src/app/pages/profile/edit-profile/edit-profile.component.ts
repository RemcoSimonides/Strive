import { Location } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild } from '@angular/core'
import { ModalController } from '@ionic/angular'

import { take } from 'rxjs/operators'

import { createUser } from '@strive/model'
import { UserForm } from '@strive/user/user/forms/user.form'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { AuthService } from '@strive/user/auth/auth.service'
import { ProfileService } from '@strive/user/user/profile.service'

import { AuthModalComponent, enumAuthSegment } from '@strive/user/auth/components/auth-modal/auth-modal.page'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'

@Component({
  selector: 'journal-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditProfileComponent {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  form = new UserForm(this.auth.profile)

  isLoggedIn$ = this.auth.isLoggedIn$
  uid = this.auth.uid

  constructor(
    private auth: AuthService,
    private cdr: ChangeDetectorRef,
    private location: Location,
    private modalCtrl: ModalController,
    private profileService: ProfileService,
    public screensize: ScreensizeService
  ) {
    this.auth.profile$.pipe(take(1)).subscribe(profile => {
      this.form.patchValue(createUser(profile))
      this.cdr.markForCheck()
    })
  }

  update() {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    if (this.form.valid) {
      this.profileService.update({ 
        uid: this.auth.uid,
        photoURL: this.form.photoURL.value,
        username: this.form.username.value
      })
      this.location.back()
    }
  }

  back() {
    this.location.back()
  }

  openAuthModal() {
    this.modalCtrl.create({
      component: AuthModalComponent,
      componentProps: {
        authSegment: enumAuthSegment.login
      }
    }).then(modal => modal.present())
  }
}