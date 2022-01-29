import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { RoadmapComponent } from './roadmap.component';

import { MilestoneDeadlineModule } from '../deadline/deadline.module';
import { MilestoneStatusModule } from '../status/status.module';
import { AssigneeModule } from '../assignee/assignee.module';

import { AddSupportModalModule } from '@strive/support/components/add/add.module';
import { ImageModule } from '@strive/media/directives/image.module';
import { DetailsModule } from '../details/details.module';
import { SubtaskPipeModule } from '../../pipes/subtask.pipe';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    ReactiveFormsModule,
    IonicModule,
    
    ImageModule,
    MilestoneDeadlineModule,
    MilestoneStatusModule,
    AssigneeModule,
    AddSupportModalModule,
    DetailsModule,
    SubtaskPipeModule
  ],
  exports: [
    RoadmapComponent
  ],
  declarations: [
    RoadmapComponent
  ]
})
export class RoadmapModule { }
