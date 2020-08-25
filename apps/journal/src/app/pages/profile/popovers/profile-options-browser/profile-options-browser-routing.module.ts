import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileOptionsBrowserPage } from './profile-options-browser.page';

const routes: Routes = [
  {
    path: '',
    component: ProfileOptionsBrowserPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileOptionsBrowserPageRoutingModule {}
