import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { GoalViewPage } from './view.page';
import { GoalPageModule } from './goal/goal.module';
import { TeamModule } from './team/team.module';
import { AdminRoadmapModule } from './roadmap/roadmap.module';
import { StoryModule } from './story/story.module';

const routes: Routes = [
  {
    path: '',
    component: GoalViewPage
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    GoalPageModule,
    TeamModule,
    AdminRoadmapModule,
    StoryModule
  ],
  declarations: [GoalViewPage]
})
export class GoalViewModule {}
