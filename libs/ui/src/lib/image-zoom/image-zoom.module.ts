import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { ImageZoomModalComponent } from './image-zoom.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModule } from '../header/header.module'
import { MediaPipeModule } from '@strive/media/pipes/media.pipe'

@NgModule({
	imports: [
		CommonModule,
		ImageModule,
		MediaPipeModule,
		HeaderModule
	],
	declarations: [
		ImageZoomModalComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageZoomModalModule { }
