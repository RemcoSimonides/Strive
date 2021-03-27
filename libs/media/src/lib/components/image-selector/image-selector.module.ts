import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ImageSelectorComponent } from './image-selector.component';

@NgModule({
  imports: [
    CommonModule
  ],
  exports: [ImageSelectorComponent],
  declarations: [ImageSelectorComponent]
})
export class ImageSelectorModule { }
