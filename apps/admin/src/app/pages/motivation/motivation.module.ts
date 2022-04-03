import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { IonicModule } from '@ionic/angular';

import { MotivationComponent } from './motivation.component';

const routes: Routes = [
  {
    path: '',
    component: MotivationComponent
  }
];


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonicModule,
    FlexLayoutModule,
    RouterModule.forChild(routes),
  ],
  declarations: [MotivationComponent],
  exports: [MotivationComponent]
})
export class MotivationModule {}