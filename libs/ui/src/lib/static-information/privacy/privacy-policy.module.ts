import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { PrivacyPolicy } from './privacy-policy.page';

const routes: Routes = [
  {
    path: '',
    component: PrivacyPolicy
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [PrivacyPolicy],
  exports: [PrivacyPolicy]
})
export class PrivacyPolicyModule {}
