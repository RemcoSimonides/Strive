import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DetailsComponent } from './details.component';

import { MilestoneStatusModule } from '@strive/ui/roadmap/components/status/status.module';
import { MilestoneDeadlineModule } from '@strive/ui/roadmap/components/deadline/deadline.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,

    MilestoneStatusModule,
    MilestoneDeadlineModule
  ],
  declarations: [
    DetailsComponent
  ]
})
export class DetailsModule {}