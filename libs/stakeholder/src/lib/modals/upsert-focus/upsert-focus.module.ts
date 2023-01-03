
import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { ReactiveFormsModule } from '@angular/forms'
import { IonicModule } from '@ionic/angular'

import { FocusModalComponent } from './upsert-focus.component'

import { HeaderModule } from '@strive/ui/header/header.module'

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ReactiveFormsModule,
		HeaderModule
	],
	declarations: [
		FocusModalComponent
	],
	exports: [
		FocusModalComponent
	]
})
export class FocusModalModule {}