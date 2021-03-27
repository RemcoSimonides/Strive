import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { RoadmapComponent } from './roadmap.component';

import { RoadmapModule as RoadmapUIModule } from '@strive/ui/roadmap/roadmap.module';
import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module';
import { AddSupportModalModule } from '@strive/support/components/add/add.module';
import { MilestoneOptionsPopoverModule } from '@strive/milestone/components/options/options.module';
import { ImageModule } from '@strive/media/directives/image.module';


@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    RoadmapUIModule,
    UpsertPostModalModule,
    AddSupportModalModule,
    MilestoneOptionsPopoverModule,
    ImageModule
  ],
  exports: [RoadmapComponent],
  declarations: [RoadmapComponent],
})
export class RoadmapModule { }
