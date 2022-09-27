import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'

import { ThumbnailListComponent } from './thumbnail-list.component'
import { IonicModule } from '@ionic/angular'
import { SwiperModule } from 'swiper/angular'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    SwiperModule
  ],
  exports: [ThumbnailListComponent],
  declarations: [ThumbnailListComponent]
})
export class ThumbnailListModule { }
