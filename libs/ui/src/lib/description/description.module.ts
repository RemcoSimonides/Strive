import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { DescriptionComponent } from './description.component'

import { HTMLPipeModule } from '@strive/utils/pipes/string-to-html.pipe'

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ReactiveFormsModule,
		HTMLPipeModule
	],
	declarations: [
		DescriptionComponent
	],
	exports: [
		DescriptionComponent
	]
})
export class DescriptionModule {}