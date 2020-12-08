import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { RectangleThumbnailComponent } from './rectangle-thumbnail.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FlexLayoutModule
  ],
  exports: [RectangleThumbnailComponent],
  declarations: [RectangleThumbnailComponent],
})
export class RectangleThumbnailModule { }
