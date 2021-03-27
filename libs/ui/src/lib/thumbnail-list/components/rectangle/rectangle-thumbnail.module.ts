import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { RectangleThumbnailComponent } from './rectangle-thumbnail.component';
import { ImageModule } from '@strive/media/directives/image.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FlexLayoutModule,
    ImageModule
  ],
  exports: [RectangleThumbnailComponent],
  declarations: [RectangleThumbnailComponent],
})
export class RectangleThumbnailModule { }
