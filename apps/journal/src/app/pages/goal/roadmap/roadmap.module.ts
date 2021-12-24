import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { RoadmapComponent } from './roadmap.component';

import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module';
import { ImageModule } from '@strive/media/directives/image.module';
import { RoadmapModule as RoadmapUIModule } from '@strive/goal/milestone/components/roadmap/roadmap.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    RoadmapUIModule,
    UpsertPostModalModule,
    ImageModule
  ],
  exports: [RoadmapComponent],
  declarations: [RoadmapComponent],
})
export class RoadmapModule { }
