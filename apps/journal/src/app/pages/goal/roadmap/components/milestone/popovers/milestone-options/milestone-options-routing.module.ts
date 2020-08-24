import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MilestoneOptionsPage } from './milestone-options.page';

const routes: Routes = [
  {
    path: '',
    component: MilestoneOptionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MilestoneOptionsPageRoutingModule {}
