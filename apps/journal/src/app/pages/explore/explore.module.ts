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
    ImageModule
  ],
  declarations: [
    ExplorePage
  ]
})
export class ExplorePageModule {}
