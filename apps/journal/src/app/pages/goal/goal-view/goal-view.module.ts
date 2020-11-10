import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
// Services
import { AuthGuardService } from '../../../services/auth-guard/auth-guard.service'
import { GoalAuthGuardService } from '@strive/goal/goal/guards/goal-auth-guard.service';

// Pages
import { GoalViewPage } from './goal-view.page'

import { GoalPageModule } from '../goal/goal.module';
import { AddSupportModalPage } from '../modals/add-support-modal/add-support-modal.page'

// Components
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { PageNotFoundModule } from '@strive/ui/page-not-found/page-not-found.module';
import { ComponentsModule } from '../../../components/components.module'
import { RoadmapModule } from '../roadmap/components/roadmap.module'
import { UpsertPostModalModule } from '@strive/post/components/upsert-modal/upsert-modal.module'

import { QuillModule } from 'ngx-quill'

const routes: Routes = [
  { path: '', component: GoalViewPage },
  { 
    path: 'edit', 
    loadChildren: () => import('../roadmap/pages/edit-default-roadmap/edit-default-roadmap.module').then(m => m.EditDefaultRoadmapPageModule), canActivate: [AuthGuardService, GoalAuthGuardService] },
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    RoadmapModule,
    QuillModule,
    PageLoadingModule,
    PageNotFoundModule,
    UpsertPostModalModule,
    GoalPageModule
  ],
  declarations: [
    GoalViewPage,
    AddSupportModalPage,
  ],
  entryComponents: [
    AddSupportModalPage,
  ]
})
export class GoalViewPageModule {}
