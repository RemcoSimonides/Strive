import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { GoalOptionsPopoverComponent } from './options.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [],
  declarations: [GoalOptionsPopoverComponent],
})
export class GoalOptionsModule { }
