import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ReactiveFormsModule } from '@angular/forms'
import { EditProfileImagePopoverComponent } from './edit-profile-image.component'

import { ImageSelectorComponent } from '@strive/media/components/image-selector/image-selector.component'
import { IonButton } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ImageSelectorComponent,
    IonButton
  ],
  declarations: [EditProfileImagePopoverComponent]
})
export class EditProfileImagePopoverModule { }
