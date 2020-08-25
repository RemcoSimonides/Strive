import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExerciseAssessLifePage } from './exercise-assess-life.page';

const routes: Routes = [
  {
    path: '',
    component: ExerciseAssessLifePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExerciseAssessLifePageRoutingModule {}
