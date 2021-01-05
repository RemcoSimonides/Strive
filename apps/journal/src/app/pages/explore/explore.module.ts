import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ExplorePage } from './explore.page';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module'
import { RectangleThumbnailModule } from '@strive/ui/thumbnail-list/components/rectangle/rectangle-thumbnail.module'

import { ScrollVanishDirectiveModule } from '@strive/ui/directives/scroll-vanish.directive';

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
    
    // Strive
    ThumbnailListModule,
    RectangleThumbnailModule,
    ScrollVanishDirectiveModule
  ],
  declarations: [
    ExplorePage
  ]
})
export class ExplorePageModule {}
