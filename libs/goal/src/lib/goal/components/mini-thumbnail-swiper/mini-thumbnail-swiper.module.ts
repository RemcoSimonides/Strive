import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { SwiperModule } from 'swiper/angular'

import { MiniThumbnailSwiperComponent } from './mini-thumbnail-swiper.component'
import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SwiperModule,
    ImageModule
  ],
  declarations: [MiniThumbnailSwiperComponent],
  exports: [MiniThumbnailSwiperComponent]
})
export class MiniThumbnailSwiperModule { }