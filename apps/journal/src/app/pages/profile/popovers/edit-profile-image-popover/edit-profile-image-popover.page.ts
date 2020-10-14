import { Component } from '@angular/core';
import { PopoverController } from '@ionic/angular';
// Services
import { ImageService } from 'apps/journal/src/app/services/image/image.service';
// Interfaces
import { UserService } from '@strive/user/user/+state/user.service';

@Component({
  selector: 'app-edit-profile-image-popover',
  templateUrl: './edit-profile-image-popover.page.html',
  styleUrls: ['./edit-profile-image-popover.page.scss'],
})
export class EditProfileImagePopoverPage {

  _saving: boolean = false

  constructor(
    private imageService: ImageService,
    private popoverCtrl: PopoverController,
    public user: UserService
  ) { }

  dismiss(image: string) {
    this.popoverCtrl.dismiss(image)
  }

  public async updateProfileImage(): Promise<void> {

    if (this._saving) return
    this._saving = true

    if (this.imageService.image) {
      const image = await this.imageService.uploadImage(`Profiles/${this.user.uid}/${this.user.uid}`, false)
      await this.user.upsertProfile({ image: image })

      this.dismiss(image)
      this._saving = false

    }
    this.imageService.reset()

  }

}
