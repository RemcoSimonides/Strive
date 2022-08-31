import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'
import { FlexLayoutModule } from '@angular/flex-layout'

import { GoalComponent } from './goal.page'

import { GoalOptionsModule } from '../popovers/options/options.module'
import { GoalSharePopoverModule } from '@strive/goal/goal/components/popovers/share/share.module'
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module'
import { TeamModalModule } from '@strive/goal/stakeholder/modals/team/team.module'
import { ImageModule } from '@strive/media/directives/image.module'
import { AddSupportModalModule } from '@strive/support/components/add/add.module'
import { ImageZoomModalModule } from '@strive/ui/image-zoom/image-zoom.module'
import { RoadmapModule } from '@strive/goal/milestone/components/roadmap/roadmap.module'
import { StoryModule } from '@strive/goal/story/components/story/story.module'
import { GoalDescriptionModule } from '@strive/goal/goal/components/description/description.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    FlexLayoutModule,
    
    // Strive
    GoalOptionsModule,
    GoalSharePopoverModule,
    UpsertGoalModalModule,
    TeamModalModule,
    AddSupportModalModule,
    ImageModule,
    ImageZoomModalModule,
    RoadmapModule,
    StoryModule,
    GoalDescriptionModule
  ],
  exports: [GoalComponent],
  declarations: [GoalComponent],
})
export class GoalPageModule { }
