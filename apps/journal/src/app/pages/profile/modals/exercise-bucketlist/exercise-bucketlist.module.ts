import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ExerciseBucketlistPageRoutingModule } from './exercise-bucketlist-routing.module';

import { ExerciseBucketlistPage } from './exercise-bucketlist.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ExerciseBucketlistPageRoutingModule
  ],
  declarations: []
})
export class ExerciseBucketlistPageModule {}
