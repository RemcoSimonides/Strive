import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ImageCropperModule } from 'ngx-image-cropper'
import { ImageModule } from '../../directives/image.module'

import { ImageSelectorComponent } from './image-selector.component'
import { IonFabButton, IonIcon } from '@ionic/angular/standalone'

@NgModule({
  imports: [
    CommonModule,
    ImageCropperModule,
    ImageModule,
    IonFabButton,
    IonIcon
  ],
  exports: [ImageSelectorComponent],
  declarations: [ImageSelectorComponent]
})
export class ImageSelectorModule { }
