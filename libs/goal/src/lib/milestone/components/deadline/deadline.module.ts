import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MilestoneDeadlineComponent } from './deadline.component';

import { DatetimeModule } from '@strive/ui/datetime/datetime.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    DatetimeModule
  ],
  declarations: [
    MilestoneDeadlineComponent
  ],
  exports: [
    MilestoneDeadlineComponent
  ]
})
export class MilestoneDeadlineModule { }