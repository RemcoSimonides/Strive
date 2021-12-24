import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { RoadmapComponent } from './roadmap.component';

import { MilestoneDeadlineModule } from '@strive/ui/roadmap/components/deadline/deadline.module';
import { MilestoneStatusModule } from '@strive/ui/roadmap/components/status/status.module';

import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module';
import { AddSupportModalModule } from '@strive/support/components/add/add.module';
import { ImageModule } from '@strive/media/directives/image.module';

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
    UpsertPostModalModule,
    AddSupportModalModule
  ],
  exports: [
    RoadmapComponent
  ],
  declarations: [
    RoadmapComponent
  ]
})
export class RoadmapModule { }
