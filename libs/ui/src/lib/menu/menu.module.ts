import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { MenuComponent } from './menu.component'

import { ImageModule } from '@strive/media/directives/image.module'

@NgModule({
	imports: [
		CommonModule,
		RouterModule,
		IonicModule,
		ImageModule
	],
	declarations: [
		MenuComponent
	]
})
export class MenuModule {}