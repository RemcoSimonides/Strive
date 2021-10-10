import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CollectiveGoalsPage } from './collective-goals.page';
import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';

const routes: Routes = [
  {
    path: '',
    component: CollectiveGoalsPage
  },
  {
    path: ':id',
    loadChildren: () => import('./collective-goal/view.module').then(m => m.CollectiveGoalViewModule)
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule
  ],
  declarations: [CollectiveGoalsPage]
})
export class CollectiveGoalsPageModule {}
