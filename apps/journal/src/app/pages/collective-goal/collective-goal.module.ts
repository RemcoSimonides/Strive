import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { CollectiveGoalPage } from './collective-goal.page';

import { CollectiveGoalOptionsPopoverModule } from './popovers/options/options.module';
import { CollectiveGoalSharePopoverModule } from './popovers/share/share.module';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CollectiveGoalGuard } from '@strive/collective-goal/collective-goal/guards/collective-goal.guard';
import { UpsertCollectiveGoalModule } from './modals/upsert/upsert.module';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module';
import { RectangleThumbnailModule } from '@strive/ui/thumbnail-list/components/rectangle/rectangle-thumbnail.module';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { PageNotFoundModule } from '@strive/ui/page-not-found/page-not-found.module';
import { HeaderModule } from '@strive/ui/header/header.module';
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module';
import { TextEditorModule } from '@strive/ui/text-editor/text-editor.module';
import { ImageModule } from '@strive/media/directives/image.module';

const routes: Routes = [
  {
    path: '',
    component: CollectiveGoalPage
  },
  { path: 'template/:templateId',
    loadChildren: () => import('../template/template.module').then(m => m.TemplatePageModule),
    canActivate: [CollectiveGoalGuard]
  },
];

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,

    FontAwesomeModule,
    IonicModule,
    RouterModule.forChild(routes),

    CollectiveGoalOptionsPopoverModule,
    CollectiveGoalSharePopoverModule,
    UpsertCollectiveGoalModule,

    // Strive
    ThumbnailListModule,
    RectangleThumbnailModule,
    PageLoadingModule,
    PageNotFoundModule,
    HeaderModule,
    UpsertGoalModalModule,
    TextEditorModule,
    ImageModule
  ],
  declarations: [
    CollectiveGoalPage,
  ],
  exports: []
})
export class CollectiveGoalPageModule {}
