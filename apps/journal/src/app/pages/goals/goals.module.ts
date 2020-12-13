import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GoalsPage } from './goals.page';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module';
import { RectangleThumbnailModule } from '@strive/ui/thumbnail-list/components/rectangle/rectangle-thumbnail.module';
import { HeaderModule } from '@strive/ui/header/header.module';

// Components
import { ComponentsModule } from '../../components/components.module'

const routes: Routes = [
  {
    path: '',
    component: GoalsPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    ComponentsModule,
    ThumbnailListModule,
    RectangleThumbnailModule,
    HeaderModule
  ],
  declarations: [
    GoalsPage,
  ]
})
export class GoalsPageModule {}
