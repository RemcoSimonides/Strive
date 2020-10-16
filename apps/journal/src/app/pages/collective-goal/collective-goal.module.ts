import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CollectiveGoalPage } from './collective-goal.page';

import { CollectiveGoalOptionsPage } from './popovers/collective-goal-options/collective-goal-options.page';
import { CollectiveGoalSharePopoverPage } from './popovers/collective-goal-share-popover/collective-goal-share-popover.page';

import { ComponentsModule } from '../../components/components.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CollectiveGoalAuthGuardService } from '@strive/collective-goal/collective-goal/guards/collective-goal.guard';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module';
import { ThumbnailListPipeModule } from '@strive/ui/thumbnail-list/thumbnail-list.pipe';

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
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    // Strive
    ThumbnailListModule,
    ThumbnailListPipeModule
  ],
  declarations: [
    CollectiveGoalPage,
    CollectiveGoalOptionsPage,
    CollectiveGoalSharePopoverPage
  ],
  entryComponents: [
    CollectiveGoalOptionsPage,
    CollectiveGoalSharePopoverPage
  ],
  exports: []
})
export class CollectiveGoalPageModule {}
