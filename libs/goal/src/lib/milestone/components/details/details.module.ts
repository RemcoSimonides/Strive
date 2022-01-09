import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DetailsComponent } from './details.component';

import { MilestoneStatusModule } from '../status/status.module';
import { MilestoneDeadlineModule } from '../deadline/deadline.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    MilestoneStatusModule,
    MilestoneDeadlineModule
  ],
  declarations: [
    DetailsComponent
  ]
})
export class DetailsModule {}