import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { AdminRoadmapComponent } from './roadmap.component'

import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { SubtaskPipeModule } from '@strive/roadmap/pipes/subtask.pipe'
import { AssigneeModule } from '@strive/roadmap/components/assignee/assignee.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageLoadingComponent,
    SubtaskPipeModule,
    AssigneeModule,
  ],
  declarations: [AdminRoadmapComponent],
  exports: [AdminRoadmapComponent]
})
export class AdminRoadmapModule {}
