import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'
// Ionic
import { IonicModule } from '@ionic/angular'
// Roadmap Components
import { DefaultRoadmapComponent } from './default-roadmap/default-roadmap.component'
import { MilestoneComponent } from './milestone/milestone.component'
// Popovers
import { MilestoneOptionsPage } from './milestone/popovers/milestone-options/milestone-options.page';
// Other
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IonicModule,
  ],
  declarations: [
    DefaultRoadmapComponent,
    MilestoneComponent,
    MilestoneOptionsPage
  ],
  entryComponents: [
    MilestoneOptionsPage
  ],
  exports: [
    DefaultRoadmapComponent,
    MilestoneComponent
  ]
})
export class RoadmapModule { }
