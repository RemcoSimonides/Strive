import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GoalsPage } from './goals.page';

// Strive
import { ThumbnailListModule } from '@strive/ui/thumbnail-list/thumbnail-list.module';
import { ThumbnailListPipeModule } from '@strive/ui/thumbnail-list/thumbnail-list.pipe';

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
    ThumbnailListPipeModule
  ],
  declarations: [
    GoalsPage,
  ]
})
export class GoalsPageModule {}
