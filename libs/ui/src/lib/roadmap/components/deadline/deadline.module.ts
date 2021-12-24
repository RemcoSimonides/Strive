import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { MilestoneDeadlineComponent } from './deadline.component';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    FontAwesomeModule
  ],
  declarations: [
    MilestoneDeadlineComponent
  ],
  exports: [
    MilestoneDeadlineComponent
  ]
})
export class MilestoneDeadlineModule { }