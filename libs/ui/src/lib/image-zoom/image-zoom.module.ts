import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { ImageZoomModalComponent } from './image-zoom.component'

import { SwiperModule } from 'swiper/angular'
import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModule } from '../header/header.module'

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		SwiperModule,
		ImageModule,
		HeaderModule
	],
	declarations: [
		ImageZoomModalComponent
	]
})
export class ImageZoomModalModule {}