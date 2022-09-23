import { Location } from '@angular/common'
import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core'
import { UserForm } from '@strive/user/user/forms/user.form'
import { ScreensizeService } from '@strive/utils/services/screensize.service'
import { take } from 'rxjs/operators'
import { createUser } from '@strive/model'
import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { AuthService } from '@strive/user/auth/auth.service'
import { ProfileService } from '@strive/user/user/profile.service'

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
    private location: Location,
    private profileService: ProfileService,
    public screensize: ScreensizeService
  ) {
    this.auth.profile$.pipe(take(1)).subscribe(profile => {
      this.form.patchValue(createUser(profile))
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

}