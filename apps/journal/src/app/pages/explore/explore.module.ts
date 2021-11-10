import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { ExplorePage } from './explore.page';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail/layout/list/thumbnail-list.module'
import { SmallThumbnailModule } from '@strive/ui/thumbnail/components/small/small-thumbnail.module';
import { LargeThumbnailModule } from '@strive/ui/thumbnail/components/large/large-thumbnail.module';
import { RowsPipeModule } from '@strive/ui/thumbnail/pipes/rows.pipe';
import { BannerModule } from '@strive/ui/thumbnail/components/banner/banner.module';
import { ImageModule } from '@strive/media/directives/image.module';

const routes: Routes = [
  {
    path: '',
    component: ExplorePage
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    
    // Strive
    ThumbnailListModule,
    SmallThumbnailModule,
    LargeThumbnailModule,
    RowsPipeModule,
    BannerModule,
    ImageModule,
  ],
  declarations: [
    ExplorePage
  ]
})
export class ExplorePageModule {}
