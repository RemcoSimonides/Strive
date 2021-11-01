import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { IonicModule } from '@ionic/angular';

import { ExplorePage } from './explore.page';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module'
import { RectangleThumbnailModule } from '@strive/ui/thumbnail-list/components/rectangle/rectangle-thumbnail.module'
import { SmallThumbnailModule } from '@strive/ui/thumbnail-list/components/small/small-thumbnail.module';
import { LargeThumbnailModule } from '@strive/ui/thumbnail-list/components/large/large-thumbnail.module';
import { RowsPipeModule } from '@strive/ui/thumbnail-list/pipes/rows.pipe';
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
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    FlexLayoutModule,
    
    // Strive
    ThumbnailListModule,
    RectangleThumbnailModule,
    SmallThumbnailModule,
    LargeThumbnailModule,
    RowsPipeModule,
    ImageModule
  ],
  declarations: [
    ExplorePage
  ]
})
export class ExplorePageModule {}
