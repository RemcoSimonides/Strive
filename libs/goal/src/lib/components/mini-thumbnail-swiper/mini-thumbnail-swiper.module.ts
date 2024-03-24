import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { IonicModule } from '@ionic/angular'

import { MiniThumbnailSwiperComponent } from './mini-thumbnail-swiper.component'
import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ImageModule
  ],
  declarations: [MiniThumbnailSwiperComponent],
  exports: [MiniThumbnailSwiperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MiniThumbnailSwiperModule { }