import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Routes, RouterModule } from '@angular/router'

import { IonicModule } from '@ionic/angular'

// Pages
import { GoalViewComponent } from './goal-view.page'

import { GoalPageModule } from '../goal/goal.module'

// Components
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module'
import { RoadmapModule } from '../roadmap/roadmap.module'
import { StoryModule } from '../story/story.module'
import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module'
import { PagenotfoundModule } from '@strive/ui/404/404.module'
import { HeaderRootModule } from '@strive/ui/header-root/header-root.module'

const routes: Routes = [
  { path: '', component: GoalViewComponent }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    GoalPageModule,
    RoadmapModule,
    StoryModule,
    UpsertPostModalModule,
    PagenotfoundModule,
    HeaderRootModule
  ],
  declarations: [
    GoalViewComponent,
  ],
})
export class GoalViewPageModule {}
