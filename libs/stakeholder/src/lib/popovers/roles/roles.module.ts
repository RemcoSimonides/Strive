import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { RolesPopoverComponent } from './roles.component'

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ReactiveFormsModule
	],
	declarations: [
		RolesPopoverComponent
	]
})
export class RolesPopoverModule {}