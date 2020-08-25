import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ExerciseDailyGratefulnessPage } from './exercise-daily-gratefulness.page';

const routes: Routes = [
  {
    path: '',
    component: ExerciseDailyGratefulnessPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExerciseDailyGratefulnessPageRoutingModule {}
