import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MiniThumbnailSwiperComponent } from './mini-thumbnail-swiper.component'
import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
  imports: [
    CommonModule,
    ImageModule
  ],
  declarations: [MiniThumbnailSwiperComponent],
  exports: [MiniThumbnailSwiperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MiniThumbnailSwiperModule { }
