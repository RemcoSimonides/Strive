import { Location } from "@angular/common";
import { ChangeDetectionStrategy, Component, ViewChild } from "@angular/core";
import { UserService } from "@strive/user/user/user.service";
import { UserForm } from "@strive/user/user/forms/user.form";
import { ScreensizeService } from "@strive/utils/services/screensize.service";
import { take } from "rxjs/operators";
import { createUser } from "@strive/model";
import { ImageSelectorComponent } from "@strive/media/components/image-selector/image-selector.component";

@Component({
  selector: 'journal-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditProfileComponent {
  @ViewChild(ImageSelectorComponent) imageSelector?: ImageSelectorComponent

  form = new UserForm(this.user.user)

  constructor(
    private location: Location,
    public screensize: ScreensizeService,
    public user: UserService
  ) {
    this.user.user$.pipe(take(1)).subscribe(user => {
      this.form.patchValue(createUser(user))
    })
  }

  update() {
    if (this.imageSelector?.step.value === 'crop') {
      this.imageSelector.cropIt()
    }

    if (this.form.valid) {
      this.user.update({ 
        uid: this.user.uid,
        photoURL: this.form.photoURL.value!,
        username: this.form.username.value!
      })
      this.location.back()
    }
  }

  back() {
    this.location.back()
  }

}