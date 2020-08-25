import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExerciseDailyGratefulnessPageRoutingModule } from './exercise-daily-gratefulness-routing.module';

import { ExerciseDailyGratefulnessPage } from './exercise-daily-gratefulness.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExerciseDailyGratefulnessPageRoutingModule
  ],
  declarations: []
})
export class ExerciseDailyGratefulnessPageModule {}
