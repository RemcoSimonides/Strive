import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { RoadmapComponent } from './roadmap.component';

import { RoadmapModule as RoadmapUIModule } from '@strive/goal/milestone/components/roadmap/roadmap.module';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageLoadingModule,
    RoadmapUIModule
  ],
  declarations: [RoadmapComponent],
  exports: [RoadmapComponent]
})
export class RoadmapModule {}
