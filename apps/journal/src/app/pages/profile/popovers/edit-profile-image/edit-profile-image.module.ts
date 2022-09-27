import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { EditProfileImagePopoverComponent } from './edit-profile-image.component'

import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    ImageSelectorModule
  ],
  declarations: [EditProfileImagePopoverComponent]
})
export class EditProfileImagePopoverModule {}