import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { DescriptionComponent } from './description.component'

import { HTMLPipeModule } from '@strive/utils/pipes/string-to-html.pipe'
import { IonItem, IonTextarea, IonButton } from '@ionic/angular/standalone'

@NgModule({
	imports: [
		CommonModule,
		ReactiveFormsModule,
		HTMLPipeModule,
		IonItem,
		IonTextarea,
		IonButton
	],
	declarations: [
		DescriptionComponent
	],
	exports: [
		DescriptionComponent
	]
})
export class DescriptionModule { }
