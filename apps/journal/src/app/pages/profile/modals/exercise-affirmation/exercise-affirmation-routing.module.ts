import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExerciseAffirmationPage } from './exercise-affirmation.page';

const routes: Routes = [
  {
    path: '',
    component: ExerciseAffirmationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExerciseAffirmationPageRoutingModule {}
