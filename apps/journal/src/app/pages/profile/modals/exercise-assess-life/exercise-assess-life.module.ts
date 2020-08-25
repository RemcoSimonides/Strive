import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExerciseAssessLifePageRoutingModule } from './exercise-assess-life-routing.module';

import { ExerciseAssessLifePage } from './exercise-assess-life.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExerciseAssessLifePageRoutingModule
  ],
  declarations: []
})
export class ExerciseAssessLifePageModule {}
