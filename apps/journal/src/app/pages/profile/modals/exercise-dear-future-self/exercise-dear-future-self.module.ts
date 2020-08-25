import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExerciseDearFutureSelfPageRoutingModule } from './exercise-dear-future-self-routing.module';

import { ExerciseDearFutureSelfPage } from './exercise-dear-future-self.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExerciseDearFutureSelfPageRoutingModule
  ],
  declarations: []
})
export class ExerciseDearFutureSelfPageModule {}
