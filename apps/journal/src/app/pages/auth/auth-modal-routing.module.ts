import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AuthModalPage } from './auth-modal.page';

const routes: Routes = [
  {
    path: '',
    component: AuthModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthModalPageRoutingModule {}
