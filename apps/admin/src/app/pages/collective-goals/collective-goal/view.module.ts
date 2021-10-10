import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { CollectiveGoalViewPage } from './view.page';
import { CollectiveGoalPageModule } from './collective-goal/collective-goal.module';
import { TeamModule } from './team/team.module';
import { TemplatesModule } from './templates/templates.module';

const routes: Routes = [
  {
    path: '',
    component: CollectiveGoalViewPage
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    CollectiveGoalPageModule,
    TeamModule,
    TemplatesModule
  ],
  declarations: [CollectiveGoalViewPage]
})
export class CollectiveGoalViewModule {}
