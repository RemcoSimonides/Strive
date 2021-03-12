import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { RoadmapComponent } from './roadmap.component';

import { RoadmapModule as RoadmapUIModule } from '@strive/ui/roadmap/roadmap.module';
import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module';
import { AddSupportModalPageModule } from '../modals/add-support-modal/add-support-modal.module';
import { MilestoneOptionsPopoverModule } from '@strive/milestone/components/options/options.module';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    RoadmapUIModule,
    UpsertPostModalModule,
    AddSupportModalPageModule,
    MilestoneOptionsPopoverModule
  ],
  exports: [RoadmapComponent],
  declarations: [RoadmapComponent],
})
export class RoadmapModule { }
