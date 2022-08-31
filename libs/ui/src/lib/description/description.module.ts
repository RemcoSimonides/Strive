import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { DescriptionComponent } from './description.component'

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ReactiveFormsModule
	],
	declarations: [
		DescriptionComponent
	],
	exports: [
		DescriptionComponent
	]
})
export class DescriptionModule {}