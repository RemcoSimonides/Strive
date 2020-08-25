import { Component, OnInit } from '@angular/core';
import { AuthService } from 'apps/journal/src/app/services/auth/auth.service';
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
import { PopoverController } from '@ionic/angular';
import { IProfile } from 'apps/journal/src/app/interfaces/profile.interface';
import { ProfileService } from 'apps/journal/src/app/services/profile/profile.service';

import { Plugins } from '@capacitor/core';
const { Camera } = Plugins;

@Component({
  selector: 'app-edit-profile-image-popover',
  templateUrl: './edit-profile-image-popover.page.html',
  styleUrls: ['./edit-profile-image-popover.page.scss'],
})
export class EditProfileImagePopoverPage implements OnInit {

  _profile: IProfile
  _saving: boolean = false

  constructor(
    private authService: AuthService,
    private imageService: ImageService,
    private popoverCtrl: PopoverController,
    private profileService: ProfileService,
  ) { }

  async ngOnInit() {
    this._profile = await this.authService.getCurrentUserProfile()
  }

  async dismiss(image: string) {
    await this.popoverCtrl.dismiss(image)
  }

  
  public async updateProfileImage(): Promise<void> {

    if (this._saving) return
    this._saving = true

    if (this.imageService.image) {
      const uid = await this.authService.afAuth.currentUser
      const image = await this.imageService.uploadImage(`Profiles/${uid}/${uid}`, false)
      await this.profileService.upsert({ image: image  })

      this.dismiss(image)
      this._saving = false

    }
    this.imageService.reset()

  }

}
