import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Routes } from '@angular/router';

import { AssessLifeComponent } from './assess-life.component';

import { PageLoadingModule } from '@strive/ui/page-loading/page-loading.module';
import { AuthModalModule } from '@strive/user/auth/components/auth-modal/auth-modal.module';

const routes: Routes = [
  {
    path: '',
    component: AssessLifeComponent
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
  declarations: [AssessLifeComponent]
})
export class AssessLifeModule {}