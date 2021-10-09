import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { RoadmapComponent } from './roadmap.component';
import { EditRoadmapModule } from '@strive/milestone/components/edit-roadmap/edit-roadmap.module';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageLoadingModule,
    EditRoadmapModule
  ],
  declarations: [RoadmapComponent],
  exports: [RoadmapComponent]
})
export class RoadmapModule {}
