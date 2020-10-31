import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { CollectiveGoalPage } from './collective-goal.page';

import { CollectiveGoalOptionsPopoverModule } from './popovers/options/options.module';
import { CollectiveGoalSharePopoverModule } from './popovers/share/share.module';

import { ComponentsModule } from '../../components/components.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CollectiveGoalAuthGuardService } from '@strive/collective-goal/collective-goal/guards/collective-goal.guard';
import { UpsertCollectiveGoalModule } from './modals/upsert/upsert.module';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module';
import { ThumbnailListPipeModule } from '@strive/ui/thumbnail-list/thumbnail-list.pipe';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { PageNotFoundModule } from '@strive/ui/page-not-found/page-not-found.module';

const routes: Routes = [
  {
    path: '',
    component: CollectiveGoalPage
  },
  { path: 'template/:templateId', loadChildren: () => import('../template/template.module').then(m => m.TemplatePageModule), canActivate: [CollectiveGoalAuthGuardService] },
];

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FlexLayoutModule,

    FontAwesomeModule,
    IonicModule,
    RouterModule.forChild(routes),

    CollectiveGoalOptionsPopoverModule,
    CollectiveGoalSharePopoverModule,
    UpsertCollectiveGoalModule,

    // Strive
    ThumbnailListModule,
    ThumbnailListPipeModule,
    PageLoadingModule,
    PageNotFoundModule
  ],
  declarations: [
    CollectiveGoalPage,
  ],
  exports: []
})
export class CollectiveGoalPageModule {}
