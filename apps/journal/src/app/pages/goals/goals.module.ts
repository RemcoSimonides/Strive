import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { GoalsPage } from './goals.page';

// Strive
import { SmallThumbnailModule } from '@strive/ui/thumbnail-list/components/small/small-thumbnail.module';
import { LargeThumbnailModule } from '@strive/ui/thumbnail-list/components/large/large-thumbnail.module';
import { HeaderModule } from '@strive/ui/header/header.module';
import { UpsertGoalModalModule } from '@strive/goal/goal/components/upsert/upsert.module';
import { UpsertCollectiveGoalModule } from '@strive/collective-goal/collective-goal/modals/upsert/upsert.module';

const routes: Routes = [
  {
    path: '',
    component: GoalsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
    SmallThumbnailModule,
    LargeThumbnailModule,
    HeaderModule,
    UpsertGoalModalModule,
    UpsertCollectiveGoalModule
  ],
  declarations: [GoalsPage]
})
export class GoalsPageModule {}
