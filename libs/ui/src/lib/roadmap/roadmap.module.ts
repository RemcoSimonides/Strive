import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { RoadmapComponent, MilestoneDirective } from './roadmap.component';
import { MilestoneDeadlineComponent } from './components/deadline/deadline.component';
import { MilestoneStatusComponent } from './components/status/status.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    FontAwesomeModule,
    IonicModule
  ],
  exports: [
    MilestoneDirective,
    RoadmapComponent,
    MilestoneDeadlineComponent,
    MilestoneStatusComponent
  ],
  declarations: [
    MilestoneDirective,
    RoadmapComponent,
    MilestoneDeadlineComponent,
    MilestoneStatusComponent
  ]
})
export class RoadmapModule { }
