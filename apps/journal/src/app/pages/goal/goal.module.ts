import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { GoalComponent } from './goal.page'

import { GoalOptionsModule } from './popovers/options/options.module'
import { AddOthersModalComponent } from './modals/add-others/add-others.component'

import { GoalSharePopoverModule } from '@strive/goal/goal/popovers/share/share.module'
import { UpsertGoalModalModule } from '@strive/goal/goal/modals/upsert/upsert.module'
import { TeamModalModule } from '@strive/goal/stakeholder/modals/team/team.module'
import { RoadmapModule } from '@strive/roadmap/components/roadmap/roadmap.module'
import { StoryModule } from '@strive/story/components/story/story.module'
import { JoinButtonModule } from '@strive/goal/goal/components/join-button/join-button.module'
import { FocusModalModule } from '@strive/goal/stakeholder/modals/upsert-focus/upsert-focus.module'
import { ChatModalModule } from '@strive/chat/modals/chat/chat.module'

import { ImageZoomModalModule } from '@strive/ui/image-zoom/image-zoom.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { PagenotfoundModule } from '@strive/ui/404/404.module'
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'
import { DescriptionModule } from '@strive/ui/description/description.module'
import { DeadlinePopoverSComponent } from '@strive/goal/goal/popovers/deadline/deadline.component'

import { SupportListModule } from '@strive/support/components/list/list.module'
import { AddSupportModule } from '@strive/support/components/add/add.module'

import { ImageModule } from '@strive/media/directives/image.module'

const routes: Routes = [
  { path: '', component: GoalComponent }
]

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    
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
    ChatModalModule,
    PageLoadingModule,
    PagenotfoundModule,
    HeaderRootModule,
    AddOthersModalComponent,
    DeadlinePopoverSComponent
  ],
  exports: [GoalComponent],
  declarations: [GoalComponent],
})
export class GoalPageModule { }
