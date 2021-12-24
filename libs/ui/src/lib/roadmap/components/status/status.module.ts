import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { MilestoneStatusComponent } from './status.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule
  ],
  declarations: [
    MilestoneStatusComponent
  ],
  exports: [
    MilestoneStatusComponent
  ]
})
export class MilestoneStatusModule { }