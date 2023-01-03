import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { IonicModule } from '@ionic/angular'

import { GoalPageComponent } from './goal.page'

import { GoalOptionsModule } from './popovers/options/options.module'
import { AddOthersModalComponent } from './modals/add-others/add-others.component'

import { UpsertGoalModalModule } from '@strive/goal/modals/upsert/upsert.module'
import { JoinButtonModule } from '@strive/goal/components/join-button/join-button.module'
import { DeadlinePopoverSComponent } from '@strive/goal/popovers/deadline/deadline.component'
import { GoalSharePopoverModule } from '@strive/goal/popovers/share/share.module'

import { TeamModalModule } from '@strive/stakeholder/modals/team/team.module'
import { FocusModalModule } from '@strive/stakeholder/modals/upsert-focus/upsert-focus.module'

import { RoadmapModule } from '@strive/roadmap/components/roadmap/roadmap.module'

import { StoryModule } from '@strive/story/components/story/story.module'

import { ChatModalModule } from '@strive/chat/modals/chat/chat.module'

import { UpsertPostModalModule } from '@strive/post/modals/upsert/upsert.module'

import { ImageZoomModalModule } from '@strive/ui/image-zoom/image-zoom.module'
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { PagenotfoundModule } from '@strive/ui/404/404.module'
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'
import { DescriptionModule } from '@strive/ui/description/description.module'

import { SupportListModule } from '@strive/support/components/list/list.module'
import { AddSupportModule } from '@strive/support/components/add/add.module'

import { ImageModule } from '@strive/media/directives/image.module'

const routes: Routes = [
  { path: '', component: GoalPageComponent }
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
    DeadlinePopoverSComponent,
    UpsertPostModalModule
  ],
  declarations: [GoalPageComponent],
})
export class GoalPageModule { }
