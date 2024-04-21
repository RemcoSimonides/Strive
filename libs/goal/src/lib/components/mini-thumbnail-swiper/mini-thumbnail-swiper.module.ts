import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { MiniThumbnailSwiperComponent } from './mini-thumbnail-swiper.component'
import { ImageDirective } from '@strive/media/directives/image.directive'

@NgModule({
  imports: [
    CommonModule,
    ImageDirective
  ],
  declarations: [MiniThumbnailSwiperComponent],
  exports: [MiniThumbnailSwiperComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MiniThumbnailSwiperModule { }
