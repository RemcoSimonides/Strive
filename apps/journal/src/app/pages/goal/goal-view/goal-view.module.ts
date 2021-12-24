import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

// Pages
import { GoalViewPage } from './goal-view.page'

import { GoalPageModule } from '../goal/goal.module';

// Components
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { PageNotFoundModule } from '@strive/ui/page-not-found/page-not-found.module';
import { RoadmapModule } from '../roadmap/roadmap.module';
import { PostsModule } from '../posts/posts.module';
import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module';

const routes: Routes = [
  { path: '', component: GoalViewPage }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    PageNotFoundModule,
    GoalPageModule,
    RoadmapModule,
    PostsModule,
    UpsertPostModalModule
  ],
  declarations: [
    GoalViewPage,
  ],
})
export class GoalViewPageModule {}
