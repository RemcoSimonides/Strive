import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { DearFutureSelfComponent } from './dear-future-self.component';

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { AuthModalModule } from '@strive/user/auth/components/auth-modal/auth-modal.module';

const routes: Routes = [
  {
    path: '',
    component: DearFutureSelfComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    PageLoadingModule,
    AuthModalModule
  ],
  declarations: [DearFutureSelfComponent]
})
export class DearFutureSelfModule {}