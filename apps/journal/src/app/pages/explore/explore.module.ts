import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ExplorePage } from './explore.page';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module'
import { ThumbnailListPipeModule } from '@strive/ui/thumbnail-list/thumbnail-list.pipe';


import { ScrollVanishDirective } from '../../directives/scroll-vanish/scroll-vanish.directive';

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
    ThumbnailListPipeModule
  ],
  declarations: [
    ExplorePage,
    ScrollVanishDirective
  ]
})
export class ExplorePageModule {}
