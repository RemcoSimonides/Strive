import { CommonModule } from '@angular/common'
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core'
import { IonicModule } from '@ionic/angular'

import { ImageZoomModalComponent } from './image-zoom.component'

import { ImageModule } from '@strive/media/directives/image.module'
import { HeaderModule } from '../header/header.module'

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ImageModule,
		HeaderModule
	],
	declarations: [
		ImageZoomModalComponent
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ImageZoomModalModule {}