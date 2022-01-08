import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { MilestoneOptionsPopoverComponent } from './options.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [],
  declarations: [MilestoneOptionsPopoverComponent],
})
export class MilestoneOptionsPopoverModule { }
