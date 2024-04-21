import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { ImageZoomModalComponent } from './image-zoom.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderComponent } from '../header/header.component'
import { MediaPipeModule } from '@strive/media/pipes/media.pipe'

@NgModule({
	imports: [
		CommonModule,
		ImageModule,
		MediaPipeModule,
		HeaderComponent
	],
	declarations: [
		ImageZoomModalComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageZoomModalModule { }
