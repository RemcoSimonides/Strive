import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ImageModule } from '../../directives/image.module';

import { ImageSelectorComponent } from './image-selector.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageCropperModule,
    ImageModule,
    IonicModule
  ],
  exports: [ImageSelectorComponent],
  declarations: [ImageSelectorComponent]
})
export class ImageSelectorModule { }
