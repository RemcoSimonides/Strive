import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'
import { GoalDescriptionComponent } from './description.component'

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ReactiveFormsModule
	],
	declarations: [
		GoalDescriptionComponent
	],
	exports: [
		GoalDescriptionComponent
	]
})
export class GoalDescriptionModule {}