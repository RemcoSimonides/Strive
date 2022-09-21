import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { IonicModule } from '@ionic/angular';

import { LoginComponent } from './login.page';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [LoginComponent]
})
export class LoginModule {}
