import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExerciseDearFutureSelfPage } from './exercise-dear-future-self.page';

const routes: Routes = [
  {
    path: '',
    component: ExerciseDearFutureSelfPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExerciseDearFutureSelfPageRoutingModule {}
