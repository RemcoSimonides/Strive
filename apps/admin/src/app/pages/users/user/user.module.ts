import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { UserPage } from './user.page';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { ImageSelectorModule } from '@strive/media/components/image-selector/image-selector.module';
import { ThumbnailGridModule } from '@strive/ui/thumbnail/layout/grid/thumbnail-grid.module';
import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module';
import { DearFutureSelfPipeModule } from '@strive/exercises/dear-future-self/pipes/dear-future-self.pipe'
import { TimeToGoPipeModule } from '@strive/utils/pipes/time-to-go.pipe';
import { ImageModule } from '@strive/media/directives/image.module'
import { StatusPipeModule } from '@strive/goal/goal/pipes/status.pipe';

const routes: Routes = [
  {
    path: '',
    component: UserPage
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    ImageSelectorModule,
    ThumbnailGridModule,
    SmallThumbnailModule,
    DearFutureSelfPipeModule,
    TimeToGoPipeModule,
    ImageModule,
    StatusPipeModule
  ],
  declarations: [UserPage]
})
export class UserPageModule {}
