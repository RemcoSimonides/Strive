import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { MilestoneStatusComponent } from './status.component';
import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    UpsertPostModalModule
  ],
  declarations: [
    MilestoneStatusComponent
  ],
  exports: [
    MilestoneStatusComponent
  ]
})
export class MilestoneStatusModule { }