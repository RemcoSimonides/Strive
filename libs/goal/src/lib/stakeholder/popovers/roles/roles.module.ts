import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { RolesPopoverComponment } from './roles.component';

@NgModule({
	imports: [
		CommonModule,
		IonicModule,
		ReactiveFormsModule
	],
	declarations: [
		RolesPopoverComponment
	]
})
export class RolesPopoverModule {}