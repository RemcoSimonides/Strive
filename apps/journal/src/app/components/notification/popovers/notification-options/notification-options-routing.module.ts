import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NotificationOptionsPage } from './notification-options.page';

const routes: Routes = [
  {
    path: '',
    component: NotificationOptionsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NotificationOptionsPageRoutingModule {}
