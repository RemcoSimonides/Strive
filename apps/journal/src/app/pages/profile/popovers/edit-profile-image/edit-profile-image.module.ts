import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { EditProfileImagePopoverComponent } from './edit-profile-image.component'

import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module'
import { IonButton } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageSelectorModule,
    IonButton
  ],
  declarations: [EditProfileImagePopoverComponent]
})
export class EditProfileImagePopoverModule { }
