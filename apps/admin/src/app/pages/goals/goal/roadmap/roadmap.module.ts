import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { AdminRoadmapComponent } from './roadmap.component'

import { PageLoadingComponent } from '@strive/ui/page-loading/page-loading.component'
import { SubtasksCompletedPipe } from '@strive/roadmap/pipes/subtask.pipe'
import { AssigneeComponent } from '@strive/roadmap/components/assignee/assignee.component'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    PageLoadingComponent,
    SubtasksCompletedPipe,
    AssigneeComponent,
  ],
  declarations: [AdminRoadmapComponent],
  exports: [AdminRoadmapComponent]
})
export class AdminRoadmapModule {}
