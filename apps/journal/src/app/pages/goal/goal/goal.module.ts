import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { GoalComponent } from './goal.page'

import { GoalOptionsModule } from '../popovers/options/options.module'

import { GoalSharePopoverModule } from '@strive/goal/goal/components/popovers/share/share.module'
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module'
import { TeamModalModule } from '@strive/goal/stakeholder/modals/team/team.module'
import { RoadmapModule } from '@strive/goal/milestone/components/roadmap/roadmap.module'
import { StoryModule } from '@strive/goal/story/components/story/story.module'
import { JoinButtonModule } from '@strive/goal/goal/components/join-button/join-button.module'
import { FocusModalModule } from '@strive/goal/stakeholder/modals/upsert-focus/upsert-focus.module'
import { ChatModalModule } from '@strive/goal/chat/modals/chat/chat.module'

import { DescriptionModule } from '@strive/ui/description/description.module'
import { ImageModule } from '@strive/media/directives/image.module'
import { ImageZoomModalModule } from '@strive/ui/image-zoom/image-zoom.module'

import { SupportListModule } from '@strive/support/components/list/list.module'
import { AddSupportModule } from '@strive/support/components/add/add.module'

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule,
    
    // Strive
    GoalOptionsModule,
    GoalSharePopoverModule,
    UpsertGoalModalModule,
    TeamModalModule,
    ImageModule,
    ImageZoomModalModule,
    RoadmapModule,
    StoryModule,
    DescriptionModule,
    JoinButtonModule,
    FocusModalModule,
    SupportListModule,
    AddSupportModule,
    ChatModalModule
  ],
  exports: [GoalComponent],
  declarations: [GoalComponent],
})
export class GoalPageModule { }
