import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { MilestoneOptionsPopover } from './options.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  exports: [],
  declarations: [MilestoneOptionsPopover],
})
export class MilestoneOptionsPopoverModule { }
