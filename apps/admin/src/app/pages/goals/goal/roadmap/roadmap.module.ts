import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { AdminRoadmapComponent } from './roadmap.component';

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { SubtaskPipeModule } from '@strive/goal/milestone/pipes/subtask.pipe'
import { AssigneeModule } from '@strive/goal/milestone/components/assignee/assignee.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageLoadingModule,
    SubtaskPipeModule,
    AssigneeModule,
  ],
  declarations: [AdminRoadmapComponent],
  exports: [AdminRoadmapComponent]
})
export class AdminRoadmapModule {}
