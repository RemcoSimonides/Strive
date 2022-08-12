import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { PostComponent } from './post.component';
import { ImageModule } from '@strive/media/directives/image.module';
import { ImageZoomModalModule } from '@strive/ui/image-zoom/image-zoom.module'

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    IonicModule,
    ImageModule,
    FlexLayoutModule,
    ImageZoomModalModule
  ],
  exports: [PostComponent],
  declarations: [PostComponent],
})
export class PostComponentModule { }
