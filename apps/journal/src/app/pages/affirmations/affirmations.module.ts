import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { AffirmationsComponent } from './affirmations.component';

const routes: Routes = [
  {
    path: '',
    component: AffirmationsComponent
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule
  ],
  declarations: [AffirmationsComponent]
})
export class AffirmationsModule {}