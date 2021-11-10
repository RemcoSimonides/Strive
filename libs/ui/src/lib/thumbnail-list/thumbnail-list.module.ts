// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
// Component
import { ThumbnailListComponent } from './thumbnail-list.component';
import { IonicModule } from '@ionic/angular';
import { SwiperModule } from 'swiper/angular';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    SwiperModule
  ],
  exports: [ThumbnailListComponent],
  declarations: [ThumbnailListComponent]
})
export class ThumbnailListModule { }
